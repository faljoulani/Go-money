export type CmsImage = {
  Id?: string;
  Title?: string;
  Url?: string;
  MediaUrl?: string;
  ThumbnailUrl?: string;
  EmbedUrl?: string;
  AlternativeText?: string;
  Urls?: any;
  Provider?: string;
};

export const ImgUrl = (image?: CmsImage) =>
  image?.MediaUrl || image?.Url || image?.ThumbnailUrl || undefined;

export type CmsLink = { Href?: string; OpenInNewTab?: boolean } | string | null | undefined;

export type CmsPage = {
  Id: string;
  Title: string;
  UrlName?: string;
  ViewUrl?: string;
  RelativeUrlPath?: string;
  HasChildren?: boolean;
};

export interface ApiNavLink {
  title: string;
  url: string;
  urlName?: string;
}
export interface ApiNavDropdown extends ApiNavLink {
  children: ApiNavLink[];
}
export type ApiNavItem = ApiNavLink | ApiNavDropdown;

