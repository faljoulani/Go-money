import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { MainNavigationEntity } from './MainNavigation.entity';
import Link from 'next/link';
import Image from 'next/image';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';

type CmsLink = { Href?: string; OpenInNewTab?: boolean };
type CmsNode = {
  Id: string;
  Title: string;
  UrlName?: string;
  ViewUrl?: string;
  RelativeUrlPath?: string;
  Link?: CmsLink | null;
  Order?: number;
  HasChildren?: boolean;
  SubNavigation?: CmsNode[] | null;
};

type CmsImage = { Url?: string; Title?: string; AlternativeText?: string };
type CmsStoreLink = {
  Id: string;
  Title: string;
  Url: string | null;
  StoreType: 'Apple' | 'Google' | 'Huawei' | string;
  IsVisible?: boolean;
  Order?: number;
  Icon?: CmsImage | CmsImage[] | null;
};
export interface NavLink {
  label: string;
  href: string;
}
export interface NavDropdown extends NavLink {
  children: NavLink[];
}
export type NavItem = NavLink | NavDropdown;

function nodeHref(node: CmsNode): string {
  return (
    node?.Link?.Href ||
    node?.ViewUrl ||
    node?.RelativeUrlPath ||
    (node?.UrlName ? `/${node.UrlName}` : '#')
  );
}
function toNavItem(node: CmsNode): NavItem {
  const href = nodeHref(node);
  const kids = (node.SubNavigation || [])?.slice().sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  if (kids?.length) {
    return {
      label: node.Title,
      href,
      children: kids.map((c) => ({ label: c.Title, href: nodeHref(c) })),
    };
  }
  return { label: node.Title, href };
}

function isDropdown(item: NavItem): item is NavDropdown {
  return (item as NavDropdown).children !== undefined;
}

export default async function MainNavigation(props: WidgetContext<MainNavigationEntity>) {
  const attrs = htmlAttributes(props);

  let selection: any =
    props.model?.Properties?.MainNavigation ?? (props.model?.Properties as any)?.MainNavigation;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }
  if (!selection?.Content?.length) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="p-4 border rounded text-sm text-gray-600">
          Select a MainNavigation item in the designer.
        </section>
      );
    }
    return null;
  }

  let navRoot: any | null = null;

  const id = selection?.ItemIdsOrdered?.[0]?.toString() ?? '';
  const provider = selection?.Content?.[0]?.Variations?.[0]?.Source?.toString();

  try {
    navRoot = await RestClient.getItem({
      type: 'Telerik.Sitefinity.DynamicTypes.Model.MainNavigation.Mainnavigation',
      id,
      culture: props.requestContext.culture,
      provider,
      fields: [
        'Id',
        'Title',
        'UrlName',
        'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,Title,AlternativeText)',
        'Navigation($select=Id,Title,Order,UrlName,Link,ViewUrl,RelativeUrlPath,HasChildren,SubNavigation($select=Id,Title,Order,UrlName,Link,ViewUrl,RelativeUrlPath,HasChildren))',
        'NavPages($select=Id,Title,Order,UrlName,Link,ViewUrl,RelativeUrlPath,HasChildren,SubNavigation($select=Id,Title,Order,UrlName,Link,ViewUrl,RelativeUrlPath,HasChildren))',
        'StoreLinks($select=Id,Title,Url,StoreType,IsVisible,Order,Icon($select=Id,Url,MediaUrl,ThumbnailUrl,Title,AlternativeText))',
      ],
    });
    console.log('MainNavigation item', navRoot);
  } catch (e) {
    console.error('Error fetching MainNavigation:', e);
  }
  if (!navRoot) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="p-4 border rounded text-sm text-red-600">
          Couldn’t load MainNavigation item. Check console.
        </section>
      );
    }
    return null;
  }

  const logoUrl: string | undefined = navRoot?.Logo?.MediaUrl || navRoot?.Logo?.Url || undefined;
  const logoAlt: string =
    navRoot?.Logo?.AlternativeText || navRoot?.Logo?.Title || navRoot?.Title || 'Logo';

  const rawNodes: CmsNode[] =
    (Array.isArray(navRoot?.Navigation) && navRoot.Navigation) ||
    (Array.isArray(navRoot?.NavPages) && navRoot.NavPages) ||
    [];

  const navItems: NavItem[] = rawNodes
    .slice()
    .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
    .map(toNavItem);

  const storeLinks: CmsStoreLink[] = Array.isArray(navRoot?.StoreLinks)
    ? navRoot.StoreLinks.filter((s: CmsStoreLink) => s.IsVisible !== false)
        .slice()
        .sort((a: any, b: any) => (a.Order ?? 0) - (b.Order ?? 0))
    : [];

  const currentPath = (props.requestContext as any)?.url ?? '';
  console.log(props);

  return (
    <header {...attrs} className="sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between bg-white/40 backdrop-blur-[20px] px-8 py-4">
        <div className="flex h-[76px] w-full max-w-[1440px] items-center justify-between bg-white px-8 py-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logoUrl || '/assets/logo.png'}
                alt={logoAlt}
                width={102}
                height={45}
                priority={true}
                className="opacity-100"
              />
            </Link>
          </div>

          {/* Center: Nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                currentPath &&
                (currentPath === item.href ||
                  (item.href !== '/' && currentPath.startsWith(item.href)));

              const baseClasses =
                'relative group px-3 py-2 text-sm font-medium inline-flex items-center gap-1 no-underline transition-colors';

              return (
                <div key={item.label + item.href} className="relative">
                  <Link
                    href={item.href}
                    className={[
                      baseClasses,
                      isActive ? 'text-[#010663]' : 'text-gray-800 hover:text-primary',
                    ].join(' ')}
                  >
                    {item.label}
                    {isDropdown(item) && (
                      <svg
                        className="h-4 w-4 opacity-70"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        aria-hidden={true}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                  </Link>

                  {/* Active underline */}
                  {isActive && (
                    <div className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                  )}

                  {/* Dropdown (CSS-only using group-hover) */}
                  {isDropdown(item) && (
                    <div
                      className="
                                              pointer-events-none
                                              absolute top-full left-0 mt-2 min-w-[220px] rounded-xl border border-black/5
                                              bg-white p-2 shadow-xl opacity-0 translate-y-1
                                              transition
                                              group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                                          "
                    >
                      {item.children.map((child) => {
                        const childActive = currentPath && currentPath === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={[
                              'block rounded-lg px-3 py-2 text-sm no-underline',
                              childActive
                                ? 'text-primary bg-slate-50'
                                : 'text-gray-700 hover:bg-slate-50',
                            ].join(' ')}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: Store icons (from CMS; no client JS needed) */}
          <div className="flex items-center gap-2">
            {(storeLinks ?? []).map((link) => {
              // Normalize: pick the first image if Icon is an array
              const icon: CmsImage | undefined = Array.isArray(link.Icon)
                ? link.Icon[0]
                : link.Icon || undefined;
              const key = `${link.StoreType}::${link.Title}::${link.Url ?? 'no-url'}`;
              return (
                <a
                  key={key}
                  href={link.Url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center hover:bg-slate-200"
                  aria-label={link.Title}
                  title={link.Title}
                >
                  {icon?.Url ? (
                    <Image
                      src={icon.Title}
                      alt={icon.AlternativeText || icon.Title || link.Title}
                      width={20}
                      height={20}
                      unoptimized={true}
                    />
                  ) : (
                    <span className="text-[10px]">{link.StoreType}</span>
                  )}
                </a>
              );
            })}

            {/* Optional: fallback static stores if CMS has none */}
            {!storeLinks?.length && (
              <>
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center hover:bg-slate-200"
                  aria-label="App Store"
                >
                  <Image src="/icons/apple-store.svg" alt="Apple Store" width={20} height={20} />
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center hover:bg-slate-200"
                  aria-label="Google Play"
                >
                  <Image src="/icons/play-store.svg" alt="Google Play" width={20} height={20} />
                </a>
                <a
                  href="https://appgallery.huawei.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center hover:bg-slate-200"
                  aria-label="Huawei AppGallery"
                >
                  <Image
                    src="/icons/huawei-store.svg"
                    alt="Huawei AppGallery"
                    width={20}
                    height={20}
                  />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
