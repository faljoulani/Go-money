import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { MainNavigationEntity } from './mainNavigation.entity';
import MainNavigationClientShell from './mainNavigationClientSh';

import { resolveSitefinitySelection, resolveAbsoluteUrl, sortByOrder } from '../../../utils/utils';
import {
  fetchData,
  extractSelectionId,
  selectPrimaryImage,
  getImageSrc,
} from '../../../utils/sitefinity';

import type {
  ApiNavItem as ClientNavItem,
  ApiNavLink as ClientNavLink,
  CmsLink,
} from '../../../types/typee';

type NavSubLink = {
  Id?: string;
  Title?: string;
  UrlName?: string;
  ViewUrl?: string;
  RelativeUrlPath?: string;
};

type NavLink = {
  Id?: string;
  Title?: string;
  Order?: number;
  UrlName?: string;
  ViewUrl?: string;
  RelativeUrlPath?: string;
  Link?: CmsLink | CmsLink[] | null;
  CTAExternalUrl?: string;
  SubNavigation?: NavSubLink[];
};

type StoreLink = {
  Id?: string;
  Title?: string;
  Url?: string | null;
  StoreType?: string;
  IsVisible?: boolean;
  Order?: number;
  Icon?: any | any[] | null;
};

type MainNavigationItem = {
  Id: string;
  Title?: string;
  UrlName?: string;
  Logo?: any | any[] | null;
  NavPages?: NavLink[];
  StoreLinks?: StoreLink[];
};

type PageUrlFields = {
  urlName?: string;
  viewUrl?: string;
  relativeUrlPath?: string;
};

type NavigationUrlFields = PageUrlFields & {
  link?: CmsLink | CmsLink[] | null;
};

function resolvePageUrlFromFields({
  urlName,
  viewUrl,
  relativeUrlPath,
}: PageUrlFields): string | undefined {
  return viewUrl || relativeUrlPath || (urlName ? `/${urlName}` : undefined);
}

function resolveNavigationHref({
  link,
  urlName,
  viewUrl,
  relativeUrlPath,
}: NavigationUrlFields): string {
  const primaryLink = Array.isArray(link) ? link?.[0] : link;

  let href: string | undefined;
  if (typeof primaryLink === 'string') {
    href = primaryLink;
  } else if (primaryLink && typeof primaryLink === 'object') {
    href = primaryLink.Href;
  }

  return href ?? resolvePageUrlFromFields({ urlName, viewUrl, relativeUrlPath }) ?? '#';
}

function mapSubNavLink(subLink: NavSubLink): ClientNavLink | null {
  const title = subLink?.Title || subLink?.UrlName || '';
  if (!title) return null;

  return {
    title,
    url:
      resolvePageUrlFromFields({
        urlName: subLink?.UrlName,
        viewUrl: subLink?.ViewUrl,
        relativeUrlPath: subLink?.RelativeUrlPath,
      }) || '#',
  };
}

function mapNavLink(navLink: NavLink): ClientNavItem | null {
  const title = navLink?.Title || navLink?.UrlName || '';
  if (!title) return null;

  const children = (navLink?.SubNavigation || [])
    .map(mapSubNavLink)
    .filter(Boolean) as ClientNavLink[];

  const url = resolveNavigationHref({
    link: navLink.CTAExternalUrl,
    urlName: navLink?.UrlName,
    viewUrl: navLink?.ViewUrl,
    relativeUrlPath: navLink?.RelativeUrlPath,
  });
  return children.length ? { title, url, children } : { title, url };
}

export default async function MainNavigation(props: WidgetContext<MainNavigationEntity>) {
  const attrs = htmlAttributes(props);
  const { requestContext } = props;
  const { culture, isEdit } = requestContext;

  const selection = resolveSitefinitySelection((props.model?.Properties as any)?.MainNavigation);
  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>Select a MainNavigation</strong>
        <div className="mt-1">Select a MainNavigation item.</div>
      </section>
    ) : null;
  }

  const FIELDS = [
    'Id',
    'Title',
    'UrlName',
    'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)',
    'NavPages($select=Id,Title,Order,CTAExternalUrl,ViewUrl,RelativeUrlPath,Link,SubNavigation($select=Id,Title,UrlName,ViewUrl,RelativeUrlPath))',
    'StoreLinks($select=Id,Title,Url,StoreType,IsVisible,Order,Icon($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
  ];

  const mainNavigationPayload = await fetchData([id], null, culture, FIELDS, {
    itemType: selection?.Content?.[0]?.Type,
    single: true,
  });
  const mainNavigationData: MainNavigationItem | null = mainNavigationPayload
    ? ((Array.isArray(mainNavigationPayload) ? mainNavigationPayload[0] : mainNavigationPayload) ??
      null)
    : null;

  if (!mainNavigationData) {
    return isEdit ? (
      <section {...attrs} className="p-4 text-sm text-gray-600">
        Couldn’t load the selected MainNavigation item.
      </section>
    ) : null;
  }

  const logoImg = selectPrimaryImage(mainNavigationData.Logo);
  const logoRaw = getImageSrc(logoImg);
  const logoUrl = logoRaw ? resolveAbsoluteUrl(logoRaw, requestContext) : '/assets/logo.png';
  const logoAlt = logoImg?.AlternativeText || logoImg?.Title || mainNavigationData.Title || 'Logo';

  const navItems: ClientNavItem[] = sortByOrder(mainNavigationData.NavPages || [])
    .map(mapNavLink)
    .filter(Boolean) as ClientNavItem[];

  const storeLinks = sortByOrder(mainNavigationData.StoreLinks || [])
    .filter((store) => store?.IsVisible !== false)
    .map((store) => {
      const icon = selectPrimaryImage(store?.Icon);
      const raw = getImageSrc(icon);
      const iconUrl = raw ? resolveAbsoluteUrl(raw, requestContext) : undefined;

      return {
        title: store?.Title || '',
        url: store?.Url || undefined,
        order: store?.Order,
        storeType: store?.StoreType,
        iconUrl,
        iconAlt: icon?.AlternativeText || icon?.Title,
      };
    });

  const currentPath = (requestContext as any)?.url ?? '';

  return (
    <MainNavigationClientShell
      attrs={attrs}
      logoUrl={logoUrl}
      logoAlt={logoAlt}
      navItems={navItems}
      storeLinks={storeLinks}
      currentPath={currentPath}
      requestContext={requestContext}
    />
  );
}
