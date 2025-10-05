'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EmptyState from './noCareers';
import JobCard from '../../../atoms/jobCard/jobCard';
import Pagination from './pagination';
import { daysSinceUtc } from '../../../../utils/utils';
import { useDirection } from '../../../../utils/helpers';
import Image from 'next/image';

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
  pageSize: 9,
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

const mapItemToJob = (i: CareersItem): Job => ({
  id: i.Id,
  title: i.Title,
  location: i.LocationName,
  department: i.DepartmentName,
  departmentId: i.DepartmentId,
  workType: i.EmploymentType,
  postedDaysAgo: i.PostedAgoDays ?? 0,
});

function buildFacets(
  items: CareersItem[],
  selected: { locationNames: string[]; departmentNames: string[] },
): { locations: CareersFiltration[]; departments: CareersFiltration[] } {
  const mk = (pick: (x: CareersItem) => string, selectedNames: string[]) => {
    const counts = new Map<string, number>();
    for (const it of items) {
      const key = pick(it);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts]
      .map(([name, count]) => ({ name, count, selected: selectedNames.includes(name) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };
  return {
    locations: mk((x) => x.LocationName, selected.locationNames),
    departments: mk((x) => x.DepartmentName, selected.departmentNames),
  };
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  bodyId,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  bodyId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl shadow-md bg-surface-section p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          className="flex h-9 w-9 items-center justify-center rounded border border-primaryAlt bg-primaryAlt text-white text-lg font-bold
                     dark:bg-transparent dark:text-primaryAlt"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      <div id={bodyId} className={`mt-3 font-semibold ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
}

function FacetCheckbox({
  facet,
  onToggle,
}: {
  facet: CareersFiltration;
  onToggle: (name: string) => void;
}) {
  return (
    <li className="py-1">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={facet.selected}
          onChange={() => onToggle(facet.name)}
          className="h-4 w-4 cursor-pointer accent-primaryAlt dark:accent-primary"
        />
        <span className="text-sm text-default dark:text-white">{facet.name}</span>
        <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400">
          {facet.count}
        </span>
      </label>
    </li>
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

  const allItems = useMemo(
    () => (careers || []).map((c) => mapCareerToItem(c, isRtl ? 'ar' : 'en')),
    [careers, isRtl],
  );

  if (allItems.length === 0) {
    return (
      <section className={`mx-auto py-10 md:px-10 ${className ?? ''}`}>
        <EmptyState />
      </section>
    );
  }

  const vacanciesLabel = labels?.vacanciesLabel ?? 'Available vacancies';
  const locationLabel = labels?.locationLabel ?? 'Filter by Location';
  const departmentLabel = labels?.departmentLabel ?? 'Filter by Department';

  const [query, setQuery] = useState<CareersSearchBody>({ ...DEFAULT_SEARCH, ...initialBody });
  const [draft, setDraft] = useState<CareersSearchBody>({ ...DEFAULT_SEARCH, ...initialBody });

  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { locations: locationFacets, departments: departmentFacets } = useMemo(
    () =>
      buildFacets(allItems, {
        locationNames: showMobileFilters ? draft.locationNames : query.locationNames,
        departmentNames: showMobileFilters ? draft.departmentNames : query.departmentNames,
      }),
    [
      allItems,
      draft.departmentNames,
      draft.locationNames,
      query.departmentNames,
      query.locationNames,
      showMobileFilters,
    ],
  );

  const filteredItems = useMemo(() => {
    const base: CareersItem[] =
      typeof structuredClone === 'function'
        ? structuredClone(allItems)
        : JSON.parse(JSON.stringify(allItems));
    const toSet = (arr: string[]) => new Set(arr.map((x) => x.toLowerCase()));
    const inSet = (s: Set<string>, v: string) => s.has((v || '').toLowerCase());
    const hasText = (s?: string | null) => !!s && s.trim().length > 0;
    const byDate = (date?: string) => +new Date(date || 0);

    let filteredJobs = base;

    if (query.locationNames.length) {
      const want = toSet(query.locationNames);
      filteredJobs = filteredJobs.filter((i) => inSet(want, i.LocationName));
    }
    if (query.departmentNames.length) {
      const want = toSet(query.departmentNames);
      filteredJobs = filteredJobs.filter((i) => inSet(want, i.DepartmentName));
    }
    if (hasText(query.search)) {
      const needle = query.search!.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (i) =>
          i.Title.toLowerCase().includes(needle) ||
          i.DepartmentName.toLowerCase().includes(needle) ||
          i.LocationName.toLowerCase().includes(needle),
      );
    }

    filteredJobs = filteredJobs
      .slice()
      .sort((a, b) =>
        query.sort === 'postedAt_asc'
          ? byDate(a.PostedAtUtc) - byDate(b.PostedAtUtc)
          : byDate(b.PostedAtUtc) - byDate(a.PostedAtUtc),
      );

    return filteredJobs;
  }, [allItems, query]);

  const { pageItems, totalResults, totalPages, page } = useMemo(() => {
    const pageSize = Math.max(1, query.pageSize || 9);
    const totalResults = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    const safePage = Math.min(Math.max(1, query.page || 1), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      pageItems: filteredItems.slice(start, start + pageSize),
      totalResults,
      totalPages,
      page: safePage,
    };
  }, [filteredItems, query.page, query.pageSize]);

  const jobs = useMemo(() => pageItems.map(mapItemToJob), [pageItems]);
  const hasResults = totalResults > 0;

  type QueryKey = 'locationNames' | 'departmentNames';

  const toggleSingleFacet = useCallback((key: QueryKey, name: string) => {
    setDraft((d) => ({ ...d, page: 1, [key]: d[key][0] === name ? [] : [name] }));
  }, []);

  const toggleFacet = useCallback((key: QueryKey, name: string) => {
    setQuery((q) => {
      const exists = q[key].includes(name);
      const nextVals = exists ? q[key].filter((n) => n !== name) : [...q[key], name];
      return { ...q, page: 1, [key]: nextVals } as CareersSearchBody;
    });
  }, []);

  const handlePage = useCallback(
    (n: number) =>
      setQuery((q) => ({
        ...q,
        page: Math.max(1, Math.min(n, Math.max(1, totalPages))),
      })),
    [totalPages],
  );

  const handlePageSize = useCallback(
    (n: number) => setQuery((q) => ({ ...q, page: 1, pageSize: n })),
    [],
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
    setDraft((d) => ({
      ...d,
      page: 1,
      locationNames: [],
      departmentNames: [],
      search: null,
      sort: 'postedAt_desc',
    }));
  }, []);

  const removeChip = useCallback((key: QueryKey, name: string) => {
    setQuery((q) => ({
      ...q,
      page: 1,
      [key]: (q[key] as string[]).filter((n) => n !== name),
    }));
    setDraft((d) => ({
      ...d,
      page: 1,
      [key]: (d[key] as string[]).filter((n) => n !== name),
    }));
  }, []);

  useEffect(() => {
    if (showMobileFilters) {
      document.documentElement.classList.add('modal-open');
    } else {
      document.documentElement.classList.remove('modal-open');
    }
    return () => document.documentElement.classList.remove('modal-open');
  }, [showMobileFilters]);

  return (
    <section className={`mx-auto py-10 md:px-10 ${className ?? ''}`}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Sidebar filters (md+) */}
        <aside className="hidden md:flex md:flex-col basis-1/4 min-w-0 space-y-6">
          <FilterSection
            title={locationLabel}
            isOpen={isLocationOpen}
            onToggle={() => setIsLocationOpen((v) => !v)}
            bodyId="filter-body-locations"
          >
            <ul className="max-h-80 space-y-1.5 overflow-auto pr-1">
              {locationFacets.map((f) => (
                <FacetCheckbox
                  key={f.name}
                  facet={f}
                  onToggle={(name) => toggleFacet('locationNames', name)}
                />
              ))}
            </ul>
          </FilterSection>

          <FilterSection
            title={departmentLabel}
            isOpen={isDepartmentOpen}
            onToggle={() => setIsDepartmentOpen((v) => !v)}
            bodyId="filter-body-departments"
          >
            <ul className="max-h-80 space-y-1.5 overflow-auto pr-1">
              {departmentFacets.map((f) => (
                <FacetCheckbox
                  key={f.name}
                  facet={f}
                  onToggle={(name) => toggleFacet('departmentNames', name)}
                />
              ))}
            </ul>
          </FilterSection>
        </aside>

        {/* Main column */}
        <div className="min-w-0 max-w-[888px] flex min-h-[600px] flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl md:text-28px font-semibold text-default md:text-primary">
              {vacanciesLabel}
            </h2>
            <button
              type="button"
              className="md:hidden grid h-10 w-10 place-items-center rounded-2xl 
             bg-primaryAlt dark:bg-primaryAlt"
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

          {!hasResults ? (
            <EmptyState />
          ) : (
            <>
              {/* Selected filter chips in mobile screen (reflect DRAFT) */}
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
                    <JobCard job={job} onOpen={() => onOpenJob?.(job.id, job.departmentId)} />
                  </div>
                ))}
              </div>

              {/* Pagination  */}
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
              <FilterSection
                title={locationLabel}
                isOpen={isLocationOpen}
                onToggle={() => setIsLocationOpen((v) => !v)}
                bodyId="m-filter-body-locations"
              >
                <ul className="max-h-60 space-y-2 overflow-auto pr-1">
                  {locationFacets.map((f) => (
                    <FacetCheckbox
                      key={`m-${f.name}`}
                      facet={f}
                      onToggle={(name) => toggleSingleFacet('locationNames', name)}
                    />
                  ))}
                </ul>
              </FilterSection>

              <FilterSection
                title={departmentLabel}
                isOpen={isDepartmentOpen}
                onToggle={() => setIsDepartmentOpen((v) => !v)}
                bodyId="m-filter-body-departments"
              >
                <ul className="max-h-60 space-y-2 overflow-auto pr-1">
                  {departmentFacets.map((f) => (
                    <FacetCheckbox
                      key={`m-${f.name}`}
                      facet={f}
                      onToggle={(name) => toggleSingleFacet('departmentNames', name)}
                    />
                  ))}
                </ul>
              </FilterSection>
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
                  setQuery((q) => ({ ...q, ...draft, page: 1 }));
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
    </section>
  );
}

