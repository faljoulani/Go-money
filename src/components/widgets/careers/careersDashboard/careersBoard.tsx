'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EmptyState from './noCareers';
import JobCard from '../../../atoms/jobCard/jobCard';
import Pagination from './pagination';
import { daysSinceUtc } from '../../../../utils/utils';
import { useDirection } from '../../../../utils/helpers';
import Image from 'next/image';
import { emitCareersActiveJob } from '../../../../utils/careersEvents';
import { useSfMutation } from '../../../../utils/hooks/useSfMutation';
import { useScrollFocus } from '../../../../utils/hooks/useScrollFocus';
import FullPageLoader from '../../../atoms/fullPageLoader/fullPageLoader';
import { useSearchParams } from 'next/navigation';

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

function FilterSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="mt-3 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="h-6 rounded bg-black/5 dark:bg-white/10 animate-pulse" />
      ))}
    </ul>
  );
}

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

  const isArabic = (s: string = '') => /[\u0600-\u06FF]/.test(s);

  const searchParams = useSearchParams();

  const urlPage = useMemo(
    () => Math.max(1, parseInt(searchParams.get('page') || '', 10) || 1),
    [searchParams],
  );

  const urlPageSize = useMemo(
    () => Math.max(1, parseInt(searchParams.get('pageSize') || '', 10) || 12),
    [searchParams],
  );

  const replaceUrl = useCallback((next: Partial<{ page: number; pageSize: number }>) => {
    if (typeof window === 'undefined') return;
    const current = new URL(window.location.href);
    if (next.page != null) current.searchParams.set('page', String(next.page));
    if (next.pageSize != null) current.searchParams.set('pageSize', String(next.pageSize));

    const qs = current.searchParams.toString();
    const relative = `${current.pathname}${qs ? `?${qs}` : ''}#careers-top`;
    window.history.replaceState(null, '', relative);
  }, []);

  const { post: postSearch } = useSfMutation('api/default/careers/search');
  const [apiResp, setApiResp] = useState<SearchApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [facetNames, setFacetNames] = useState<{ locations: string[]; departments: string[] }>({
    locations: [],
    departments: [],
  });

  const localItems = useMemo(
    () => (careers || []).map((c) => mapCareerToItem(c, isRtl ? 'ar' : 'en')),
    [careers, isRtl],
  );

  const [query, setQuery] = useState<CareersSearchBody>(() => ({
    ...DEFAULT_SEARCH,
    ...initialBody,
    page: initialBody?.page ?? urlPage,
    pageSize: initialBody?.pageSize ?? urlPageSize,
    language: initialBody?.language ?? lang,
  }));

  const [draft, setDraft] = useState<CareersSearchBody>(() => ({
    ...DEFAULT_SEARCH,
    ...initialBody,
    page: initialBody?.page ?? urlPage,
    pageSize: initialBody?.pageSize ?? urlPageSize,
    language: initialBody?.language ?? lang,
  }));

  const [mobileSectionsOpen, setMobileSectionsOpen] = useState<{
    locations: boolean;
    departments: boolean;
  }>({
    locations: true,
    departments: true,
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(true);
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(true);
  const showMobileFiltersRef = useRef(showMobileFilters);
  const skipFetchRef = useRef(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    showMobileFiltersRef.current = showMobileFilters;
  }, [showMobileFilters]);

  useEffect(() => {
    emitCareersActiveJob({ lang, title: null, mode: 'list' });
  }, [lang]);

  useEffect(() => {
    setFacetNames({ locations: [], departments: [] });

    setQuery((prev) => {
      if (prev.language === lang) return prev;
      const next = structuredClone(prev);
      next.language = lang;
      next.page = 1;
      return next;
    });

    setDraft((prev) => {
      if (prev.language === lang) return prev;
      const next = structuredClone(prev);
      next.language = lang;
      next.page = 1;
      return next;
    });
  }, [lang]);

  type QueryUpdater = CareersSearchBody | ((prev: CareersSearchBody) => CareersSearchBody);

  const updateQuery = useCallback((updater: QueryUpdater) => {
    setQuery((prev) =>
      typeof updater === 'function'
        ? (updater as (prev: CareersSearchBody) => CareersSearchBody)(prev)
        : updater,
    );
  }, []);

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
          language: body.language ?? lang,
          search: body.search ?? null,
        })) as SearchApiResponse;

        setApiResp(resp);

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
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch careers');
        setApiResp(null);
      } finally {
        setLoading(false);
      }
    },
    [lang, postSearch],
  );

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    fetchSearch(query);
  }, [query, fetchSearch]);

  const apiItems: CareersItem[] = useMemo(() => {
    const arr = apiResp?.Data?.Items ?? [];
    return arr.map((it) => mapApiItemToCareersItem(it, lang));
  }, [apiResp?.Data?.Items, lang]);

  const baseItems = useMemo(() => {
    if (!localItems.length) return apiItems;
    if (!apiItems.length) return localItems;

    const byId = new Map<string, CareersItem>();
    for (const item of localItems) {
      if (item?.Id) byId.set(item.Id, item);
    }
    for (const item of apiItems) {
      if (item?.Id) byId.set(item.Id, item);
    }
    return Array.from(byId.values());
  }, [apiItems, localItems]);

  //const baseItems = [];

  const filteredItems = useMemo(() => {
    const searchTerm = (query.search ?? '').trim().toLowerCase();

    return baseItems.filter((item) => {
      const matchesLocation =
        !query.locationNames?.length || query.locationNames.includes(item.LocationName);
      const matchesDepartment =
        !query.departmentNames?.length || query.departmentNames.includes(item.DepartmentName);

      if (!matchesLocation || !matchesDepartment) return false;

      if (!searchTerm) return true;

      const haystack = `${item.Title} ${item.DepartmentName} ${item.LocationName}`.toLowerCase();
      return haystack.includes(searchTerm);
    });
  }, [baseItems, query.departmentNames, query.locationNames, query.search]);

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    if (query.sort === 'postedAt_asc') {
      items.sort(
        (a, b) => new Date(a.PostedAtUtc || 0).getTime() - new Date(b.PostedAtUtc || 0).getTime(),
      );
    } else {
      items.sort(
        (a, b) => new Date(b.PostedAtUtc || 0).getTime() - new Date(a.PostedAtUtc || 0).getTime(),
      );
    }
    return items;
  }, [filteredItems, query.sort]);

  const pageSize = Math.max(1, query.pageSize);
  const totalResults = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const sliceStart = (page - 1) * pageSize;
  const pageItems = useMemo(
    () => sortedItems.slice(sliceStart, sliceStart + pageSize),
    [sortedItems, sliceStart, pageSize],
  );

  const jobs = useMemo(() => pageItems.map(mapItemToJob), [pageItems]);

  useEffect(() => {
    if (!baseItems.length) return;

    setFacetNames((prev) => {
      const locSet = new Set(prev.locations ?? []);
      const depSet = new Set(prev.departments ?? []);

      for (const item of baseItems) {
        const loc = item.LocationName?.trim();
        if (loc) locSet.add(loc);
        const dep = item.DepartmentName?.trim();
        if (dep) depSet.add(dep);
      }

      const nextLocations = Array.from(locSet).sort((a, b) => a.localeCompare(b));
      const nextDepartments = Array.from(depSet).sort((a, b) => a.localeCompare(b));

      const locationsChanged =
        nextLocations.length !== prev.locations.length ||
        nextLocations.some((name, idx) => name !== prev.locations[idx]);
      const departmentsChanged =
        nextDepartments.length !== prev.departments.length ||
        nextDepartments.some((name, idx) => name !== prev.departments[idx]);

      if (!locationsChanged && !departmentsChanged) return prev;

      return {
        locations: nextLocations,
        departments: nextDepartments,
      };
    });
  }, [baseItems]);

  const selectedLocationNames = showMobileFilters ? draft.locationNames : query.locationNames;
  const selectedDepartmentNames = showMobileFilters ? draft.departmentNames : query.departmentNames;

  const searchTerm = (query.search ?? '').trim().toLowerCase();

  const locationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    baseItems
      .filter(
        (item) =>
          (!query.departmentNames?.length || query.departmentNames.includes(item.DepartmentName)) &&
          (!searchTerm ||
            `${item.Title} ${item.DepartmentName} ${item.LocationName}`
              .toLowerCase()
              .includes(searchTerm)),
      )
      .forEach((item) => {
        const name = item.LocationName?.trim();
        if (!name) return;
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
    return counts;
  }, [baseItems, query.departmentNames, searchTerm]);

  const departmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    baseItems
      .filter(
        (item) =>
          (!query.locationNames?.length || query.locationNames.includes(item.LocationName)) &&
          (!searchTerm ||
            `${item.Title} ${item.DepartmentName} ${item.LocationName}`
              .toLowerCase()
              .includes(searchTerm)),
      )
      .forEach((item) => {
        const name = item.DepartmentName?.trim();
        if (!name) return;
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
    return counts;
  }, [baseItems, query.locationNames, searchTerm]);

  const locationFacets = useMemo(() => {
    return facetNames.locations
      .filter((name) => (lang === 'ar' ? isArabic(name) : !isArabic(name)))
      .map((name) => ({
        name,
        count: locationCounts.get(name) ?? 0,
        selected: selectedLocationNames.includes(name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [facetNames.locations, lang, locationCounts, selectedLocationNames]);

  const departmentFacets = useMemo(() => {
    return facetNames.departments
      .filter((name) => (lang === 'ar' ? isArabic(name) : !isArabic(name)))
      .map((name) => ({
        name,
        count: departmentCounts.get(name) ?? 0,
        selected: selectedDepartmentNames.includes(name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [facetNames.departments, lang, departmentCounts, selectedDepartmentNames]);

  const toggleFacet = useCallback(
    (key: QueryKey, name: string) => {
      replaceUrl({ page: 1 });
      skipFetchRef.current = true;
      updateQuery((prev) => {
        const next = structuredClone(prev);
        const current = next[key] ?? [];
        next[key] = current[0] === name ? [] : [name];
        next.page = 1;
        next.language = lang;
        return next;
      });
    },
    [lang, replaceUrl, updateQuery],
  );

  const toggleSingleFacet = useCallback(
    (key: QueryKey, name: string) => {
      setDraft((prev) => {
        const next = structuredClone(prev);
        const current = next[key] ?? [];
        next[key] = current[0] === name ? [] : [name];
        next.page = 1;
        next.language = lang;
        return next;
      });
    },
    [lang],
  );

  const toggleMobileSection = (key: 'locations' | 'departments') =>
    setMobileSectionsOpen((s) => ({ ...s, [key]: !s[key] }));

  useEffect(() => {
    if (!showMobileFilters) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMobileFilters(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showMobileFilters]);

  const handlePage = useCallback(
    (n: number) => {
      const nextPage = Math.max(1, Math.min(n, Math.max(1, totalPages)));
      replaceUrl({ page: nextPage });
      skipFetchRef.current = true;
      updateQuery((q) => ({ ...q, page: nextPage }));
    },
    [totalPages, replaceUrl, updateQuery],
  );

  const handlePageSize = useCallback(
    (n: number) => {
      const nextSize = Math.max(1, n);
      replaceUrl({ page: 1, pageSize: nextSize });
      skipFetchRef.current = true;
      updateQuery((q) => ({ ...q, page: 1, pageSize: nextSize }));
    },
    [replaceUrl, updateQuery],
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
      next.language = lang;
      return next;
    });
  }, [lang]);

  const removeChip = useCallback(
    (key: QueryKey, name: string) => {
      replaceUrl({ page: 1 });
      skipFetchRef.current = true;
      updateQuery((q) => {
        const next = structuredClone(q);
        next.page = 1;
        next[key] = (next[key] as string[]).filter((n) => n !== name);
        next.language = lang;
        return next;
      });
      setDraft((d) => {
        const next = structuredClone(d);
        next.page = 1;
        next[key] = (next[key] as string[]).filter((n) => n !== name);
        next.language = lang;
        return next;
      });
    },
    [lang, replaceUrl, updateQuery],
  );

  const handleOpenJob = useCallback(
    (id: string, departmentId: string) => {
      onOpenJob?.(id, departmentId);
    },
    [onOpenJob],
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
    setQuery((prev) => (prev.page === urlPage ? prev : { ...prev, page: urlPage }));
  }, [urlPage]);

  useEffect(() => {
    setQuery((prev) => (prev.pageSize === urlPageSize ? prev : { ...prev, pageSize: urlPageSize }));
  }, [urlPageSize]);

  const scrollDeps = useMemo(
    () => [
      page,
      query.pageSize,
      (showMobileFilters ? draft.locationNames : query.locationNames).join('|'),
      (showMobileFilters ? draft.departmentNames : query.departmentNames).join('|'),
    ],
    [
      page,
      query.pageSize,
      showMobileFilters,
      draft.locationNames,
      draft.departmentNames,
      query.locationNames,
      query.departmentNames,
    ],
  );

  const topRef = useScrollFocus({
    ready: !loading,
    deps: scrollDeps,
    behavior: 'instant',
    container: () => widgetRef.current,
    offset: 8,
    label: isRtl ? 'قائمة الوظائف' : 'Job list',
  });

  const hasResults = (totalResults ?? 0) > 0;

  const hasActiveFilters =
    Boolean((query.search ?? '').trim()) ||
    (query.locationNames?.length ?? 0) > 0 ||
    (query.departmentNames?.length ?? 0) > 0;

  if (!loading && baseItems.length === 0 && !hasActiveFilters) {
    return <EmptyState />;
  }

  return (
    <section
      ref={widgetRef}
      className={`w-full max-w-[1240px] mx-auto md:px-4 py-10 ${className ?? ''}`}
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[16rem_1fr]">
        {/* Sidebar (md+) */}
        <aside className="hidden md:flex md:flex-col basis-1/4 min-w-0 space-y-6">
          <div className="rounded-2xl shadow-md bg-surface-section p-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{labels?.locationLabel}</h3>

              {/* Collapse / Expand Button */}
              <button
                type="button"
                onClick={() => setIsLocationsOpen((prev) => !prev)}
                className="w-6 h-6 flex items-center justify-center text-14px font-bold text-white dark:text-[#010663] bg-primaryAlt rounded-lg"
                aria-label={isLocationsOpen ? 'Collapse section' : 'Expand section'}
              >
                {isLocationsOpen ? '−' : '+'}
              </button>

              {loading && (
                <span className="text-xs opacity-70 flex items-center gap-1 ml-2">
                  <Image src="/icons/spinner.svg" alt="" width={14} height={14} aria-hidden />{' '}
                  Loading
                </span>
              )}
            </div>

            {/* Collapsible content */}
            {isLocationsOpen && (
              <>
                {facetNames.locations.length === 0 ? (
                  <FilterSkeleton />
                ) : (
                  <ul className="mt-3 max-h-80 space-y-1.5 overflow-auto pr-1 transition-all duration-300 ease-in-out">
                    {locationFacets.map((f) => (
                      <li key={f.name} className="py-1">
                        <label className="flex items-center font-semibold jus gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={f.selected}
                            onChange={() => toggleFacet('locationNames', f.name)}
                            className="h-4 w-4 cursor-pointer accent-primaryAlt dark:accent-primary"
                          />
                          <span
                            className="text-sm text-default dark:text-white flex-1 truncate"
                            title={f.name}
                          >
                            {f.name}
                          </span>
                          <span className="ml-auto text-xs tabular-nums text-default dark:text-gray-400">
                            ({f.count})
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="rounded-2xl shadow-md bg-surface-section p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{labels?.departmentLabel}</h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepartmentsOpen((prev) => !prev)}
                  className="w-6 h-6 flex items-center justify-center text-14px font-bold text-white dark:text-[#010663] bg-primaryAlt rounded-lg"
                  aria-label={isLocationsOpen ? 'Collapse section' : 'Expand section'}
                >
                  {isDepartmentsOpen ? '−' : '+'}
                </button>

                {loading && (
                  <span className="text-xs opacity-70 flex items-center gap-1">
                    <Image src="/icons/spinner.svg" alt="" width={14} height={14} aria-hidden />{' '}
                    Loading
                  </span>
                )}
              </div>
            </div>

            {isDepartmentsOpen && (
              <>
                {facetNames.departments.length === 0 ? (
                  <FilterSkeleton />
                ) : (
                  <ul className="mt-3 max-h-80 space-y-1.5 overflow-auto pr-1 transition-all duration-300 ease-in-out">
                    {departmentFacets.map((f) => (
                      <li key={f.name} className="py-1">
                        <label className="flex items-center font-semibold gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={f.selected}
                            onChange={() => toggleFacet('departmentNames', f.name)}
                            className="h-4 w-4 cursor-pointer accent-primaryAlt dark:accent-primary"
                          />
                          <span className="text-sm text-default dark:text-white">{f.name}</span>
                          <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400">
                            ({f.count})
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </aside>

        {/* Main column */}
        <div className="md:min-w-[854px] flex min-h-[600px] flex-col gap-4">
          <div ref={topRef} tabIndex={-1} className="outline-none" />
          <div className="flex items-center justify-between gap-3 mb-6 md:mb-8 md:px-6">
            <h2
              id="careers-top"
              tabIndex={-1}
              className="text-2xl md:text-28px font-semibold text-default md:text-primary"
              data-careers-board-top-anchor
            >
              {labels?.vacanciesLabel}
            </h2>

            <div className="flex items-center gap-3">
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
                aria-label={isRtl ? 'فتح المرشحات' : 'Open filters'}
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
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : (
            <>
              {/* Selected filter chips (mobile) */}
              {selectedChips.length > 0 && (
                <div className="-mx-2 md:mx-0 md:hidden">
                  <div className="flex flex-nowrap gap-[6px] overflow-x-auto px-2 pb-2">
                    {selectedChips.map((c) => (
                      <button
                        key={`${c.key}:${c.name}`}
                        onClick={() => removeChip(c.key, c.name)}
                        className="inline-flex items-center justify-between max-w-[191px] h-[32px] px-[12px] py-[6px] gap-[6px]
                 rounded-[32px] border border-primary/20 bg-[#E6F3F8] text-[14px] text-[#0045AB] whitespace-nowrap truncate"
                      >
                        <span className="truncate">{c.name}</span>
                        <span className="text-lg leading-none">×</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* RESULTS AREA — reserve height so the column never collapses */}
              <div className="flex-1">
                {loading ? (
                  /* optional skeleton that matches your grid height */
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3 auto-rows-[218px]">
                    {Array.from({ length: query.pageSize }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[218px] rounded-2xl bg-black/5 dark:bg-white/10 animate-pulse"
                      />
                    ))}
                  </div>
                ) : hasResults ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3 auto-rows-[218px]">
                    {jobs.map((job) => (
                      <div key={job.id} className="h-[218px]">
                        <JobCard job={job} onOpen={() => handleOpenJob(job.id, job.departmentId)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full grid place-items-center">
                    <EmptyState />
                  </div>
                )}
              </div>

              {/* PAGINATION — always rendered and pinned to bottom of this column */}
              <div className="mt-auto pt-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalResults={totalResults}
                  pageSize={query.pageSize}
                  onPage={handlePage}
                  onPageSize={handlePageSize}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filters bottom sheet */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
            aria-label="Close filters backdrop"
            role="button"
            tabIndex={0}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-auto rounded-t-2xl bg-surface-page p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filters-title"
          >
            {/* Drag handle + header */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
            <div className="mb-2 flex items-center justify-between gap-4">
              <h3 id="mobile-filters-title" className="text-lg font-semibold">
                {isRtl ? 'التصفية' : 'Filters'}
              </h3>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-default"
                aria-label={isRtl ? 'إغلاق' : 'Close'}
              >
                {/* X icon (inline SVG to avoid extra imports) */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              {/* LOCATIONS */}
              <div className="rounded-2xl shadow-md bg-surface-section">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('locations')}
                  className="flex w-full items-center justify-between p-4"
                  aria-expanded={mobileSectionsOpen.locations}
                  aria-controls="mobile-locations-panel"
                >
                  <span className="font-semibold">{labels?.locationLabel}</span>

                  {/* Toggle icon (+ / -) */}
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-primaryAlt text-white dark:text-[#010663] font-bold transition-transform duration-200"
                    aria-hidden="true"
                  >
                    {mobileSectionsOpen.locations ? '−' : '+'}
                  </span>
                </button>

                <div
                  id="mobile-locations-panel"
                  className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                    mobileSectionsOpen.locations ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    {facetNames.locations.length === 0 ? (
                      <div className="px-4 pb-4">
                        <FilterSkeleton rows={8} />
                      </div>
                    ) : (
                      <ul className="mx-4 mb-4 mt-1 max-h-60 space-y-2 overflow-auto pr-1">
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
                </div>
              </div>

              {/* DEPARTMENTS */}
              <div className="rounded-2xl shadow-md bg-surface-section">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('departments')}
                  className="flex w-full items-center justify-between p-4"
                  aria-expanded={mobileSectionsOpen.departments}
                  aria-controls="mobile-departments-panel"
                >
                  <span className="font-semibold">{labels?.departmentLabel}</span>

                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-primaryAlt text-white dark:text-[#010663] font-bold transition-transform duration-200"
                    aria-hidden="true"
                  >
                    {mobileSectionsOpen.departments ? '−' : '+'}
                  </span>
                </button>

                <div
                  id="mobile-departments-panel"
                  className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                    mobileSectionsOpen.departments ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    {facetNames.departments.length === 0 ? (
                      <div className="px-4 pb-4">
                        <FilterSkeleton rows={8} />
                      </div>
                    ) : (
                      <ul className="mx-4 mb-4 mt-1 max-h-60 space-y-2 overflow-auto pr-1">
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
              </div>
            </div>

            {/* Footer buttons */}
            <div className="mt-5 flex w-full flex-col items-stretch gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full rounded-2xl px-4 py-2 text-primary"
              >
                {isRtl ? 'مسح' : 'Clear'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMobileFilters(false);
                  replaceUrl({ page: 1 });
                  skipFetchRef.current = true;
                  updateQuery((q) => ({ ...q, ...draft, page: 1 }));
                }}
                className="w-full rounded-2xl bg-primaryAlt px-4 py-2 text-secondary"
              >
                {isRtl ? 'تطبيق' : 'Apply'}
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

