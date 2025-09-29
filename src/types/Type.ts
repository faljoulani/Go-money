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

// src/components/widgets/careers/types.ts

/** Shared labels for UI copy */
export type Labels = {
  vacanciesLabel?: string;
  locationLabel?: string;
  departmentLabel?: string;
};

/** Raw career item coming from Sitefinity (list page cards) */
export type ModuleCareer = {
  Id: string;
  Title?: string;
  EmploymentType?: string;
  Date?: string;
  Department?: { Id?: string; Title?: string } | { Id?: string; Title?: string }[] | null;
  Location?: { Title?: string } | { Title?: string }[] | null;
  DetailUrl?: string;
  ApplyUrl?: string;
};

/** Normalized list-card job used by JobCard */
export type Job = {
  id: string;
  title: string;
  location: string;
  department: string;
  departmentId: string;
  workType: 'Full-time' | 'Part-time' | string;
  postedDaysAgo: number;
};

/** Faceting + normalized item for local filtering */
export type CareersFiltration = { name: string; count: number; selected: boolean };
export type CareersItem = {
  Id: string;
  Title: string;
  DepartmentName: string;
  DepartmentId: string;
  LocationName: string;
  EmploymentType: string;
  PostedAtUtc: string;
  PostedAgoDays: number;
  DetailUrl: string;
  ApplyUrl: string;
};

export type CareersSearchBody = {
  page: number;
  pageSize: number;
  departmentNames: string[];
  locationNames: string[];
  sort: 'postedAt_desc' | 'postedAt_asc';
  language: string;
  search?: string | null;
};

/** Job details API */
export type DetailsResponse = {
  Success: boolean;
  Error: string | null;
  Data: {
    Id: string;
    Title: string;
    DepartmentId?: string;
    DepartmentName: string;
    LocationName: string;
    EmploymentType: string;
    PostedAtUtc: string;
    PostedAgoDays: number;
    ApplyUrl: string;
    ShortMessage?: string;
    ButtonLabel?: string;
    Sections: {
      OverviewLabel?: string;
      OverviewHtml?: string;
      KeyResponsibilitiesLabel?: string;
      KeyResponsibilitiesHtml?: string;
      QualificationsLabel?: string;
      QualificationsHtml?: string;
      SkillsLabel?: string;
    };
    Skills: string[];
    ContactInfo: Array<{ Title: string; Info: string }>;
  };
};

export type JobDetails = {
  id: string;
  title: string;
  overviewHtml: string;
};

export type JobDetailsProps = {
  id: string;
  className?: string;
  onOpenJob?: (id: string) => void;
  onApply?: (id: string) => void;
};

/** Similar jobs API */
export type SimilarResponse = {
  Success: boolean;
  Error: string | null;
  Data: {
    SourceJobId: string;
    Language: string;
    Items: Array<{
      Id: string;
      Title: string;
      LocationName: string;
      EmploymentType: string;
      PostedAgoDays: number;
      ApplyUrl: string;
    }>;
  };
};

export type SimilarJobsProps = {
  jobId: string;
  departmentId?: string;
  onOpenJob?: (id: string) => void;
};

/** (Used internally by SimilarJobs to resolve departmentId if needed) */
export type SearchResponse = {
  Success: boolean;
  Error: string | null;
  Data?: {
    Items: Array<{
      Id: string;
      Title: string;
      DepartmentId: string;
      DepartmentName: string;
      LocationName: string;
      EmploymentType: string;
      PostedAtUtc: string;
      PostedAgoDays: number;
      ApplyUrl: string;
    }>;
  };
};

/** Sitefinity Form + City droplist minimal shapes (only fields we use) */
export type CityDroplistItem = { Key?: string; Value?: string };

export type SitefinityForm = {
  Title?: string;
  SubTitle?: string;
  FirstNameLabel?: string;
  FirstNamePlaceholder?: string;
  LastNameLabel?: string;
  LastNamePlaceholder?: string;
  PhoneNumberLabel?: string;
  PhoneNumberPlaceholder?: string;
  EmailLabel?: string;
  EmailPlaceholder?: string;
  CityLabel?: string;
  CityPlaceholder?: string;
  ResumeSectionTitle?: string;
  ResumeFileNote?: string;
  CoverLetterLabel?: string;
  CoverLetterPlaceholder?: string;
  ResumeInstructions?: string;
  CtaText?: string;
  CtaUrl?: any; // Link field (Href/Url)
  CityChoices?: CityDroplistItem[]; // Related data
};

export type EntityLike = {
  ApplyForm?: SitefinityForm;
  CityChoices?: CityDroplistItem[];
};

/** Apply page props (optional centralization) */
export type ApplyForJobProps = {
  dir?: 'rtl' | 'ltr' | 'auto';
  className?: string;
  backHref?: string;
  form?: SitefinityForm;
  cities?: CityDroplistItem[];
};

