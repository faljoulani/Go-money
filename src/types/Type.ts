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

export interface ApiNavLink {
  title: string;
  url: string;
  urlName?: string;
}
export interface ApiNavDropdown extends ApiNavLink {
  children: ApiNavLink[];
}
export type ApiNavItem = ApiNavLink | ApiNavDropdown;

