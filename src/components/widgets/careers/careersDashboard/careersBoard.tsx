'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EmptyState from './noCareers';
import JobCard from '../../../atoms/jobCard/jobCard';
import Pagination from './pagination';
import { daysSinceUtc } from '../../../../utils/utils';
import { useDirection } from '../../../../utils/helpers';
import Image from 'next/image';
import { useSfMutation } from '../../../../utils/hooks/useSfMutation';
import FullPageLoader from '../../../atoms/fullPageLoader/fullPageLoader';

import type {
  Labels,
  ModuleCareer,
  Job,
  CareersFiltration,
  CareersItem,
  CareersSearchBody,
} from '../../../../types/typee';

const DEFAULT_SEARCH: CareersSearchBody = {
  page: 1,
  pageSize: 12,
  departmentNames: [],
  locationNames: [],
  sort: 'postedAt_desc',
  language: 'en',
  search: null,
};

const EMPLOYMENT_TYPE_LABEL: Record<'en' | 'ar', Record<string, string>> = {
  en: { '1': 'Full-time', '2': 'Part-time' },
  ar: { '1': 'دوام كامل', '2': 'دوام جزئي' },
};

const normalizeEmploymentType = (raw?: string, lang: 'en' | 'ar' = 'en') =>
  raw ? (EMPLOYMENT_TYPE_LABEL[lang][String(raw).trim()] ?? raw) : '';

// ------- Types for API response -------
type ApiFacet = { Name: string; Count: number; Selected?: boolean };
type ApiFacets = { Locations?: ApiFacet[]; Departments?: ApiFacet[] };

type SearchApiItem = {
  Id: string;
  Title: string;
  DepartmentId: string;
  DepartmentName: string;
  LocationName: string;
  EmploymentType: string;
  PostedAtUtc: string;
  PostedAgoDays: number;
  DetailUrl: string;
  ApplyUrl: string;
};

type SearchApiResponse = {
  Success: boolean;
  Data?: {
    ItemDefaultUrl?: string;
    VacanciesLabel?: string;
    LocationLabel?: string;
    Title?: string;
    DepartmentLabel?: string;
    Provider?: string;
    Page: number;
    PageSize: number;
    TotalResults: number;
    TotalPages: number;
    Facets?: ApiFacets;
    Items: SearchApiItem[];
  };
  Error?: any;
  TraceId?: string;
};

// Helpers
function mapCareerToItem(c: ModuleCareer, lang: 'ar' | 'en'): CareersItem {
  const postedAtUtc = c.Date || '';
  return {
    Id: c.Id,
    Title: c.Title || '',
    DepartmentName: c.Department?.[0]?.Title || '',
    DepartmentId: c.Department?.[0]?.Id || '',
    LocationName: c.Location?.[0]?.Title || '',
    EmploymentType: normalizeEmploymentType(c.EmploymentType, lang),
    PostedAtUtc: postedAtUtc,
    PostedAgoDays: daysSinceUtc(postedAtUtc),
    DetailUrl: c.DetailUrl || '',
    ApplyUrl: c.ApplyUrl || '',
  };
}

const mapApiItemToCareersItem = (it: SearchApiItem, lang: 'en' | 'ar'): CareersItem => ({
  Id: it.Id,
  Title: it.Title || '',
  DepartmentId: it.DepartmentId || '',
  DepartmentName: it.DepartmentName || '',
  LocationName: it.LocationName || '',
  EmploymentType: normalizeEmploymentType(it.EmploymentType, lang),
  PostedAtUtc: it.PostedAtUtc || '',
  PostedAgoDays: it.PostedAgoDays ?? daysSinceUtc(it.PostedAtUtc),
  DetailUrl: it.DetailUrl || '',
  ApplyUrl: it.ApplyUrl || '',
});

const mapItemToJob = (i: CareersItem): Job => ({
  id: i.Id,
  title: i.Title,
  location: i.LocationName,
  department: i.DepartmentName,
  departmentId: i.DepartmentId,
  workType: i.EmploymentType,
  postedDaysAgo: i.PostedAgoDays ?? 0,
});

type QueryKey = 'locationNames' | 'departmentNames';

// Merge full known names with latest API counts; fall back to baseline counts
function mergeFacetDisplay(
  allNames: string[],
  apiArr: ApiFacet[] | undefined,
  selectedNames: string[],
  baseline: Record<string, number>,
): CareersFiltration[] {
  const byName = new Map<string, { count: number; selected: boolean }>();

  for (const f of apiArr ?? []) {
    const n = (f?.Name ?? '').trim();
    if (!n) continue;
    byName.set(n, { count: f.Count ?? 0, selected: !!f.Selected || selectedNames.includes(n) });
  }

  return allNames
    .map((name) => {
      const v = byName.get(name);
      const apiCount = v?.count;
      const baseCount = baseline?.[name];
      const count =
        typeof apiCount === 'number' ? apiCount : typeof baseCount === 'number' ? baseCount : 0;

      return {
        name,
        count,
        selected: v?.selected ?? selectedNames.includes(name),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Small skeleton for filters while facets load
function FilterSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="mt-3 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="h-6 rounded bg-black/5 dark:bg-white/10 animate-pulse" />
      ))}
    </ul>
  );
}

function getScrollableRoots(): (Window | Element)[] {
  const roots: (Window | Element)[] = [window];
  if (document.scrollingElement) roots.push(document.scrollingElement);
  roots.push(document.documentElement, document.body);
  try {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>('*'))
      .filter((el) => {
        const s = getComputedStyle(el);
        return (
          (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight
        );
      })
      .slice(0, 8);
    roots.push(...candidates);
  } catch {
    /* ignore */
  }
  return Array.from(new Set(roots.filter(Boolean)));
}

function forceScrollTop(behavior: ScrollBehavior = 'auto') {
  for (const r of getScrollableRoots()) {
    if (typeof (r as Window).scrollTo === 'function') {
      (r as Window).scrollTo({ top: 0, left: 0, behavior });
    } else {
      (r as Element).scrollTop = 0;
    }
  }
}

// function getScrollableRoots(): (Window | Element)[] {
//   const roots: (Window | Element)[] = [window];

//   // Standard roots
//   if (document.scrollingElement) roots.push(document.scrollingElement);
//   roots.push(document.documentElement, document.body);

//   try {
//     const candidates = Array.from(document.querySelectorAll<HTMLElement>('*'))
//       .filter((el) => {
//         const s = getComputedStyle(el);
//         return (
//           (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight
//         );
//       })
//       .slice(0, 8); // cap to avoid large lists
//     roots.push(...candidates);
//   } catch {
//     /* ignore */
//   }

//   // de-dupe
//   return Array.from(new Set(roots.filter(Boolean)));
// }

// function forceScrollTop(behavior: ScrollBehavior = 'auto') {
//   for (const r of getScrollableRoots()) {
//     // Window has scrollTo; Elements have scrollTop
//     if (typeof (r as Window).scrollTo === 'function') {
//       (r as Window).scrollTo({ top: 0, left: 0, behavior });
//     } else {
//       (r as Element).scrollTop = 0;
//     }
//   }
// }

export default function CareersBoard({
  labels,
  careers,
  onOpenJob,
  className,
  initialBody,
}: {
  labels: Labels;
  careers: ModuleCareer[];
  onOpenJob?: (id: string, departmentId: string) => void;
  className?: string;
  initialBody?: Partial<CareersSearchBody>;
}) {
  const dir = useDirection();
  const isRtl = dir === 'rtl';
  const lang: 'en' | 'ar' = isRtl ? 'ar' : 'en';
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  const { post: postSearch } = useSfMutation('api/default/careers/search');
  const [apiResp, setApiResp] = useState<SearchApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist facet names (union of everything we've seen)
  const [facetNames, setFacetNames] = useState<{ locations: string[]; departments: string[] }>({
    locations: [],
    departments: [],
  });

  // Baseline counts captured when NO filters are applied
  const [baselineCounts, setBaselineCounts] = useState<{
    locations: Record<string, number>;
    departments: Record<string, number>;
  }>({
    locations: {},
    departments: {},
  });

  const SCROLL_OFFSET = 96;

  const scrollToBoardTop = useCallback(() => {
    if (typeof window === 'undefined') return;

    const anchor = titleRef.current;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.requestAnimationFrame(() => {
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({
          top: Math.max(absoluteTop, 0),
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
        setTimeout(() => anchor.focus(), prefersReducedMotion ? 0 : 200);
      } else {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  }, []);

  // Local items are only a visual fallback for jobs (NOT for facets)
  const localItems = useMemo(
    () => (careers || []).map((c) => mapCareerToItem(c, isRtl ? 'ar' : 'en')),
    [careers, isRtl],
  );

  const vacanciesLabel =
    dir === 'rtl'
      ? (labels?.vacanciesLabel ?? 'الوظائف المتاحة')
      : (labels?.vacanciesLabel ?? 'Available vacancies');

  const locationLabel =
    dir === 'rtl'
      ? (labels?.locationLabel ?? 'التصفية حسب الموقع')
      : (labels?.locationLabel ?? 'Filter by Location');

  const departmentLabel =
    dir === 'rtl'
      ? (labels?.departmentLabel ?? 'التصفية حسب القسم')
      : (labels?.departmentLabel ?? 'Filter by Department');

  const [query, setQuery] = useState<CareersSearchBody>({ ...DEFAULT_SEARCH, ...initialBody });
  const [draft, setDraft] = useState<CareersSearchBody>({ ...DEFAULT_SEARCH, ...initialBody });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const showMobileFiltersRef = useRef(showMobileFilters);
  useEffect(() => {
    showMobileFiltersRef.current = showMobileFilters;
  }, [showMobileFilters]);

  type QueryUpdater = CareersSearchBody | ((prev: CareersSearchBody) => CareersSearchBody);
  type UpdateOptions = { force?: boolean };

  const updateQuery = useCallback(
    (updater: QueryUpdater, options?: UpdateOptions) => {
      setQuery((prev) => {
        const next =
          typeof updater === 'function'
            ? (updater as (prev: CareersSearchBody) => CareersSearchBody)(prev)
            : updater;

        const shouldScroll = options?.force || !showMobileFiltersRef.current;
        if (shouldScroll) scrollToBoardTop();

        return next;
      });
    },
    [scrollToBoardTop],
  );

  const fetchSearch = useCallback(
    async (body: CareersSearchBody) => {
      setLoading(true);
      setError(null);
      try {
        const resp = (await postSearch({
          page: body.page,
          pageSize: body.pageSize,
          departmentNames: body.departmentNames,
          locationNames: body.locationNames,
          sort: body.sort,
          language: body.language,
          search: body.search ?? null,
        })) as SearchApiResponse;

        setApiResp(resp);

        // Persist full set of facet names (union)
        const apiLoc =
          (resp?.Data?.Facets?.Locations ?? [])
            .map((f) => (f?.Name ?? '').trim())
            .filter(Boolean) || [];
        const apiDept =
          (resp?.Data?.Facets?.Departments ?? [])
            .map((f) => (f?.Name ?? '').trim())
            .filter(Boolean) || [];

        setFacetNames((prev) => {
          const locSet = new Set([...(prev.locations || []), ...apiLoc]);
          const depSet = new Set([...(prev.departments || []), ...apiDept]);
          return {
            locations: Array.from(locSet).sort((a, b) => a.localeCompare(b)),
            departments: Array.from(depSet).sort((a, b) => a.localeCompare(b)),
          };
        });

        // If NO filters are selected, capture baseline counts
        const noDept = !body.departmentNames?.length;
        const noLoc = !body.locationNames?.length;

        if (noDept && noLoc) {
          const locArr = resp?.Data?.Facets?.Locations ?? [];
          const deptArr = resp?.Data?.Facets?.Departments ?? [];

          const nextLocations: Record<string, number> = {};
          for (const f of locArr) {
            const n = (f?.Name ?? '').trim();
            if (n) nextLocations[n] = Math.max(0, f?.Count ?? 0);
          }

          const nextDepartments: Record<string, number> = {};
          for (const f of deptArr) {
            const n = (f?.Name ?? '').trim();
            if (n) nextDepartments[n] = Math.max(0, f?.Count ?? 0);
          }

          setBaselineCounts({
            locations: nextLocations,
            departments: nextDepartments,
          });
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch careers');
        setApiResp(null);
      } finally {
        setLoading(false);
      }
    },
    [postSearch],
  );

  useEffect(() => {
    fetchSearch(query);
  }, [query, fetchSearch]);

  // Items to render
  const apiItems: CareersItem[] = useMemo(() => {
    const arr = apiResp?.Data?.Items ?? [];
    return arr.map((it) => mapApiItemToCareersItem(it, lang));
  }, [apiResp?.Data?.Items, lang]);

  const pageItems = apiItems.length ? apiItems : localItems;
  const jobs = useMemo(() => pageItems.map(mapItemToJob), [pageItems]);

  const totalResults =
    apiResp?.Data?.TotalResults ?? (apiItems.length ? apiItems.length : localItems.length);
  const totalPages = apiResp?.Data?.TotalPages ?? 1;
  const page = apiResp?.Data?.Page ?? query.page;

  // Selected facet names (respect draft in mobile)
  const selectedLocationNames = showMobileFilters ? draft.locationNames : query.locationNames;
  const selectedDepartmentNames = showMobileFilters ? draft.departmentNames : query.departmentNames;

  // Build facets from union of known names + latest API counts with baseline fallback
  const locationFacets = useMemo(
    () =>
      mergeFacetDisplay(
        facetNames.locations,
        apiResp?.Data?.Facets?.Locations,
        selectedLocationNames,
        baselineCounts.locations,
      ),
    [
      facetNames.locations,
      apiResp?.Data?.Facets?.Locations,
      selectedLocationNames,
      baselineCounts.locations,
    ],
  );

  const departmentFacets = useMemo(
    () =>
      mergeFacetDisplay(
        facetNames.departments,
        apiResp?.Data?.Facets?.Departments,
        selectedDepartmentNames,
        baselineCounts.departments,
      ),
    [
      facetNames.departments,
      apiResp?.Data?.Facets?.Departments,
      selectedDepartmentNames,
      baselineCounts.departments,
    ],
  );

  // Single-select toggle with deep copies
  const toggleFacet = useCallback(
    (key: QueryKey, name: string) => {
      updateQuery((prev) => {
        const next = structuredClone(prev);
        const current = next[key] ?? [];
        next[key] = current[0] === name ? [] : [name];
        next.page = 1;
        return next;
      });
    },
    [updateQuery],
  );

  const toggleSingleFacet = useCallback((key: QueryKey, name: string) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const current = next[key] ?? [];
      next[key] = current[0] === name ? [] : [name];
      next.page = 1;
      return next;
    });
  }, []);

  const handlePage = useCallback(
    (n: number) => {
      updateQuery((q) => ({
        ...q,
        page: Math.max(1, Math.min(n, Math.max(1, totalPages))),
      }));
      if (typeof window !== 'undefined') {
        history.replaceState(null, '', '#careers-top');
      }
    },
    [totalPages, updateQuery],
  );

  const handlePageSize = useCallback(
    (n: number) => updateQuery((q) => ({ ...q, page: 1, pageSize: n })),
    [updateQuery],
  );

  const selectedChips = useMemo(
    () => [
      ...(query.locationNames ?? []).map((name) => ({ key: 'locationNames' as QueryKey, name })),
      ...(query.departmentNames ?? []).map((name) => ({
        key: 'departmentNames' as QueryKey,
        name,
      })),
    ],
    [query.locationNames, query.departmentNames],
  );

  const clearAllFilters = useCallback(() => {
    setDraft((d) => {
      const next = structuredClone(d);
      next.page = 1;
      next.locationNames = [];
      next.departmentNames = [];
      next.search = null;
      next.sort = 'postedAt_desc';
      return next;
    });
  }, []);

  const removeChip = useCallback(
    (key: QueryKey, name: string) => {
      updateQuery((q) => {
        const next = structuredClone(q);
        next.page = 1;
        next[key] = (next[key] as string[]).filter((n) => n !== name);
        return next;
      });
      setDraft((d) => {
        const next = structuredClone(d);
        next.page = 1;
        next[key] = (next[key] as string[]).filter((n) => n !== name);
        return next;
      });
    },
    [updateQuery],
  );

  const handleOpenJob = useCallback(
    (id: string, departmentId: string) => {
      scrollToBoardTop();
      onOpenJob?.(id, departmentId);
    },
    [onOpenJob, scrollToBoardTop],
  );

  useEffect(() => {
    if (showMobileFilters) {
      document.documentElement.classList.add('modal-open');
    } else {
      document.documentElement.classList.remove('modal-open');
    }
    return () => document.documentElement.classList.remove('modal-open');
  }, [showMobileFilters]);

  useEffect(() => {
    scrollToBoardTop();
  }, [page, query.pageSize, scrollToBoardTop]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);

    forceScrollTop('auto');
    requestAnimationFrame(() => forceScrollTop('auto'));
    setTimeout(() => forceScrollTop('auto'), 120);
  }, []);

  const hasResults = (totalResults ?? 0) > 0;

  return (
    <section className={`relative mx-auto py-10 md:px-10 ${className ?? ''}`}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden md:flex md:flex-col basis-1/4 min-w-0 space-y-6">
          <div className="rounded-2xl shadow-md bg-surface-section p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{locationLabel}</h3>
              {loading && (
                <span className="text-xs opacity-70 flex items-center gap-1">
                  <Image src="/icons/spinner.svg" alt="" width={14} height={14} aria-hidden />{' '}
                  Loading
                </span>
              )}
            </div>

            {facetNames.locations.length === 0 ? (
              <FilterSkeleton />
            ) : (
              <ul className="mt-3 max-h-80 space-y-1.5 overflow-auto pr-1">
                {locationFacets.map((f) => (
                  <li key={f.name} className="py-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={f.selected}
                        onChange={() => toggleFacet('locationNames', f.name)}
                        className="h-4 w-4 cursor-pointer accent-primaryAlt dark:accent-primary"
                      />
                      <span className="text-sm text-default dark:text-white">{f.name}</span>
                      <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400">
                        {f.count}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl shadow-md bg-surface-section p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{departmentLabel}</h3>
              {loading && (
                <span className="text-xs opacity-70 flex items-center gap-1">
                  <Image src="/icons/spinner.svg" alt="" width={14} height={14} aria-hidden />{' '}
                  Loading
                </span>
              )}
            </div>

            {facetNames.departments.length === 0 ? (
              <FilterSkeleton />
            ) : (
              <ul className="mt-3 max-h-80 space-y-1.5 overflow-auto pr-1">
                {departmentFacets.map((f) => (
                  <li key={f.name} className="py-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={f.selected}
                        onChange={() => toggleFacet('departmentNames', f.name)}
                        className="h-4 w-4 cursor-pointer accent-primaryAlt dark:accent-primary"
                      />
                      <span className="text-sm text-default dark:text-white">{f.name}</span>
                      <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400">
                        {f.count}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 max-w-[888px] flex min-h-[600px] flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="careers-top"
              ref={titleRef}
              tabIndex={-1}
              className="text-2xl md:text-28px font-semibold text-default md:text-primary scroll-mt-[96px]"
              data-careers-board-top-anchor
            >
              {vacanciesLabel}
            </h2>

            {loading ? (
              <span className="text-sm opacity-70 flex items-center gap-2">
                <Image src="/icons/spinner.svg" alt="" width={16} height={16} aria-hidden />{' '}
                Loading…
              </span>
            ) : null}

            <button
              type="button"
              className="md:hidden grid h-10 w-10 place-items-center rounded-2xl bg-primaryAlt dark:bg-primaryAlt"
              onClick={() => {
                setDraft((d) => ({ ...d, ...query }));
                setShowMobileFilters(true);
              }}
              aria-label="Open filters"
            >
              <Image
                src="/icons/filtration_button.png"
                alt=""
                width={48}
                height={48}
                aria-hidden="true"
                className="dark:invert invert-0 transition-all"
              />
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : !hasResults ? (
            <EmptyState />
          ) : (
            <>
              {/* Selected filter chips (mobile) */}
              {selectedChips.length > 0 && (
                <div className="-mx-2 md:mx-0 md:hidden">
                  <div className="flex flex-nowrap gap-2 overflow-x-auto px-2 pb-2">
                    {selectedChips.map((c) => (
                      <button
                        key={`${c.key}:${c.name}`}
                        onClick={() => removeChip(c.key, c.name)}
                        className="shrink-0 rounded-full border border-primary/20 bg-[#E6F3F8] px-4 py-2 text-14px text-[#0045AB]"
                      >
                        {c.name} <span className="pl-1.5">×</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3">
                {jobs.map((job) => (
                  <div key={job.id} className="h-[218px]">
                    <JobCard job={job} onOpen={() => handleOpenJob(job.id, job.departmentId)} />
                  </div>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                totalResults={totalResults}
                pageSize={query.pageSize}
                onPage={handlePage}
                onPageSize={handlePageSize}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile filters bottom sheet */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-auto rounded-t-2xl bg-surface-page p-5">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
            <h3 className="mb-4 text-lg font-semibold">Filters</h3>

            <div className="space-y-6">
              <div className="rounded-2xl shadow-md bg-surface-section p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{locationLabel}</h3>
                  {loading && (
                    <span className="text-xs opacity-70 flex items-center gap-1">
                      <Image src="/icons/spinner.svg" alt="" width={14} height={14} aria-hidden />{' '}
                      Loading
                    </span>
                  )}
                </div>

                {facetNames.locations.length === 0 ? (
                  <FilterSkeleton rows={8} />
                ) : (
                  <ul className="mt-3 max-h-60 space-y-2 overflow-auto pr-1">
                    {locationFacets.map((f) => (
                      <li key={`m-${f.name}`} className="py-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={f.selected}
                            onChange={() => toggleSingleFacet('locationNames', f.name)}
                            className="h-4 w-4 cursor-pointer accent-primaryAlt dark:accent-primary"
                          />
                          <span className="text-sm text-default dark:text-white">{f.name}</span>
                          <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400">
                            {f.count}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl shadow-md bg-surface-section p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{departmentLabel}</h3>
                  {loading && (
                    <span className="text-xs opacity-70 flex items-center gap-1">
                      <Image src="/icons/spinner.svg" alt="" width={14} height={14} aria-hidden />{' '}
                      Loading
                    </span>
                  )}
                </div>

                {facetNames.departments.length === 0 ? (
                  <FilterSkeleton rows={8} />
                ) : (
                  <ul className="mt-3 max-h-60 space-y-2 overflow-auto pr-1">
                    {departmentFacets.map((f) => (
                      <li key={`m-${f.name}`} className="py-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={f.selected}
                            onChange={() => toggleSingleFacet('departmentNames', f.name)}
                            className="h-4 w-4 cursor-pointer accent-primaryAlt dark:accent-primary"
                          />
                          <span className="text-sm text-default dark:text-white">{f.name}</span>
                          <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400">
                            {f.count}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-5 flex w-full flex-col items-stretch gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full rounded-2xl px-4 py-2 text-primary"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => {
                  updateQuery((q) => ({ ...q, ...draft, page: 1 }), { force: true });
                  setShowMobileFilters(false);
                }}
                className="w-full rounded-2xl bg-primaryAlt px-4 py-2 text-secondary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget-level overlay loader (no layout shift) */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <FullPageLoader />
        </div>
      )}
    </section>
  );
}


