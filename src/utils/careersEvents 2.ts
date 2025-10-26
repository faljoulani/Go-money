export const CAREERS_ACTIVE_JOB_EVENT = 'careers:active-job-title';

export type CareersActiveJobDetail = {
  title?: string | null;
  lang?: 'en' | 'ar';
  mode?: 'list' | 'details' | 'apply';
};

export function emitCareersActiveJob(detail: CareersActiveJobDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CareersActiveJobDetail>(CAREERS_ACTIVE_JOB_EVENT, { detail }));
}
