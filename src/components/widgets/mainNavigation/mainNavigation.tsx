// MainNavigation.tsx
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { MainNavigationEntity } from './MainNavigation.entity';
import Link from 'next/link';
import Image from 'next/image';

// ✅ shared helpers
import { mergeClasses, toAbsolute } from '../../../utils/utils';
import { parseSelection, extractSelectionId, fetchData } from '../../../utils/sitefinity';
import { ApiNavItem as ClientNavItem, ApiNavLink as ClientNavLink } from '../../../types/type';
import ClientNavbar from './MainNavigationClient';

/* ---------- Types from Sitefinity shapes ---------- */
type SfImage = {
  Url?: string;
  ThumbnailUrl?: string;
  Title?: string;
  AlternativeText?: string;
};
type SfLink = { Href?: string; OpenInNewTab?: boolean };
type SfSubNav = {
  Title?: string;
  UrlName?: string;
  ViewUrl?: string;
  RelativeUrlPath?: string;
};
type SfNavPage = {
  Title?: string;
  Order?: number;
  UrlName?: string;
  Link?: SfLink | SfLink[] | null;
  SubNavigation?: SfSubNav[];
};
type SfStoreLink = {
  Title?: string;
  Url?: string | null;
  StoreType?: string;
  IsVisible?: boolean;
  Order?: number;
  Icon?: SfImage[] | SfImage | null;
};

type MainNavItem = {
  Id: string;
  UrlName?: string;
  Title?: string;
  Logo?: SfImage[] | SfImage | null;
  NavPages?: SfNavPage[];
  StoreLinks?: SfStoreLink[];
};

/* ---------- Normalized shapes ---------- */
type NormalizedImage = {
  title?: string;
  alt?: string;
  url?: string;
  thumbnailUrl?: string;
};

type NormalizedSubNav = {
  title: string;
  urlName?: string;
  viewUrl?: string;
  relativeUrlPath?: string;
};

type NormalizedNavPage = {
  title: string;
  order?: number;
  urlName?: string;
  link?: any[] | { Href?: string; OpenInNewTab?: boolean } | null;
  subNavigation?: NormalizedSubNav[];
};

type NormalizedStoreLink = {
  title: string;
  order?: number;
  isVisible?: boolean;
  storeType?: string;
  url?: string | null;
  icon?: NormalizedImage | null;
};

type NormalizedMainNav = {
  id: string;
  urlName?: string;
  title?: string;
  logo?: NormalizedImage | null;
  navPages: NormalizedNavPage[];
  storeLinks: NormalizedStoreLink[];
};

/* ---------- Helpers ---------- */
function urlFromNormalized(x: {
  urlName?: string;
  viewUrl?: string;
  relativeUrlPath?: string;
  link?: any;
}): string {
  const linkObj = Array.isArray(x?.link) ? undefined : x?.link;
  return linkObj?.Href || x?.viewUrl || x?.relativeUrlPath || (x?.urlName ? `/${x.urlName}` : '#');
}

function toClientItem(node: NormalizedNavPage): ClientNavItem | null {
  const title = node.title || node.urlName || '';
  if (!title) return null;

  const url = urlFromNormalized(node);

  const children: ClientNavLink[] =
    node.subNavigation
      ?.map((c) => {
        const ct = c.title || c.urlName || '';
        if (!ct) return null;
        return { title: ct, url: urlFromNormalized(c) };
      })
      .filter((x): x is ClientNavLink => Boolean(x)) ?? [];

  return children.length > 0 ? { title, url, children } : { title, url };
}

function normalizeFromRaw(raw: any): NormalizedMainNav {
  const firstLogo = Array.isArray(raw?.Logo) ? raw.Logo[0] : undefined;
  const logo: NormalizedImage | null = firstLogo
    ? {
        title: firstLogo.Title,
        alt: firstLogo.AlternativeText,
        url: firstLogo.Url,
        thumbnailUrl: firstLogo.ThumbnailUrl,
      }
    : null;

  const navPages: NormalizedNavPage[] = (raw?.NavPages ?? []).map((p: any) => ({
    title: p.Title,
    order: p.Order,
    urlName: p.UrlName,
    link: p.Link ?? [],
    subNavigation: (p.SubNavigation ?? []).map((s: any) => ({
      title: s.Title,
      urlName: s.UrlName,
      viewUrl: s.ViewUrl,
      relativeUrlPath: s.RelativeUrlPath,
    })),
  }));

  const storeLinks: NormalizedStoreLink[] = (raw?.StoreLinks ?? []).map((s: any) => ({
    title: s.Title,
    order: s.Order,
    isVisible: s.IsVisible,
    storeType: s.StoreType,
    url: s.Url,
    icon:
      Array.isArray(s.Icon) && s.Icon[0]
        ? {
            title: s.Icon[0].Title,
            alt: s.Icon[0].AlternativeText,
            url: s.Icon[0].Url,
            thumbnailUrl: s.Icon[0].ThumbnailUrl,
          }
        : null,
  }));

  return {
    id: raw?.Id,
    urlName: raw?.UrlName,
    title: raw?.Title,
    logo,
    navPages,
    storeLinks,
  };
}

/* ---------- Server Component ---------- */
export default async function MainNavigation(props: WidgetContext<MainNavigationEntity>) {
  const attrs = htmlAttributes(props);
  const selection = parseSelection((props.model?.Properties as any)?.MainNavigation);

  if (!selection?.Content?.length) {
    return props.requestContext.isEdit ? (
      <section {...attrs} className="p-4 border rounded text-sm text-gray-600">
        Select a MainNavigation item in the designer.
      </section>
    ) : null;
  }

  const id = extractSelectionId(selection);

  const FIELDS = [
    'Id',
    'Title',
    'UrlName',
    'Logo($select=Url,ThumbnailUrl,Title,AlternativeText)',
    'NavPages($select=Title,Order,UrlName,Link,SubNavigation($select=Title,UrlName,ViewUrl,RelativeUrlPath))',
    'StoreLinks($select=Title,Url,StoreType,IsVisible,Order,Icon($select=Url,ThumbnailUrl,Title,AlternativeText))',
  ];

  const raw = await fetchData([id], null, props.requestContext.culture, FIELDS, {
    itemType:
      selection?.Content?.[0]?.Type ??
      'Telerik.Sitefinity.DynamicTypes.Model.MainNavigation.Mainnavigation',
    single: true,
  });

  const data: NormalizedMainNav | null = raw
    ? normalizeFromRaw((Array.isArray(raw) ? raw[0] : raw) as unknown as MainNavItem)
    : null;

  if (!data) {
    return props.requestContext.isEdit ? (
      <section {...attrs} className="p-4 border rounded text-sm text-red-600">
        Couldn’t load MainNavigation item. Check console.
      </section>
    ) : null;
  }

  // Prefer full Url, fallback to ThumbnailUrl, and make absolute if relative
  const logoUrl = toAbsolute(
    data.logo?.url || data.logo?.thumbnailUrl || '/assets/logo.png',
    props.requestContext,
  );
  const logoAlt = data.logo?.alt || data.logo?.title || data.title || 'Logo';

  // Build items for ClientNavbar
  const navItems: ClientNavItem[] = (data.navPages ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(toClientItem)
    .filter((x): x is ClientNavItem => Boolean(x));

  const storeLinks = (data.storeLinks ?? [])
    .filter((s) => s.isVisible !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const currentPath = (props.requestContext as any)?.url ?? '';

  return (
    <header
      {...attrs}
      className={mergeClasses(
        'fixed top-0 left-0 right-0 z-[200]',
        'bg-transparent',
        (attrs as any).className,
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div
          className={mergeClasses(
            'mx-auto flex items-center justify-between rounded-3xl overflow-visible pointer-events-auto',
            'h-[84px] px-6 sm:px-8 max-w-[1440px]',
            'bg-transparent ring-0 shadow-none',
          )}
        >
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2" aria-label="Home">
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={102}
                height={45}
                priority
                className="opacity-100"
                unoptimized
              />
            </Link>
          </div>

          {/* Center: Nav */}
          <ClientNavbar
            items={navItems}
            currentPath={currentPath}
            className="flex items-center gap-1"
          />

          {/* Right: Store badges */}
          <div className="flex items-center gap-2">
            {storeLinks.map((link) => {
              const key = `${link.storeType}:${link.title}:${link.url ?? 'no-url'}`;
              const rawIcon = link.icon?.url || link.icon?.thumbnailUrl;
              const iconSrc = toAbsolute(rawIcon || '', props.requestContext);

              return (
                <a
                  key={key}
                  href={link.url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-2xl bg-white/70 ring-1 ring-black/5 grid place-items-center hover:bg-white transition"
                  aria-label={link.title}
                  title={link.title}
                >
                  {iconSrc ? (
                    <Image
                      src={iconSrc}
                      alt={link.icon?.alt || link.icon?.title || link.title!}
                      width={20}
                      height={20}
                      unoptimized
                    />
                  ) : (
                    <span className="text-[10px]">{link.title}</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
