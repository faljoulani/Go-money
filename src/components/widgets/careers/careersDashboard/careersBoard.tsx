// CareersBoard.tsx
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import EmptyState from './noCareers';
import JobCard from '../../../atoms/jobCard/jobCard';
import Pagination from './pagination';
import { daysSinceUtc } from '../../../../utils/utils';

import type {
  Labels,
  ModuleCareer,
  Job,
  CareersFiltration,
  CareersItem,
  CareersSearchBody,
} from '../../../../types/typee';

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  '1': 'Full-time',
  '2': 'Part-time',
};

const DEFAULT_SEARCH: CareersSearchBody = {
  page: 1,
  pageSize: 9,
  departmentNames: [],
  locationNames: [],
  sort: 'postedAt_desc',
  language: 'en',
  search: null,
};

const normalizeEmploymentType = (raw?: string) =>
  raw ? (EMPLOYMENT_TYPE_LABEL[String(raw).trim()] ?? raw) : '';

function mapCareerToItem(career: ModuleCareer): CareersItem {
  const postedAtUtc = career.Date || '';
  return {
    Id: career.Id,
    Title: career.Title || '',
    DepartmentName: career.Department?.[0]?.Title || '',
    DepartmentId: career.Department?.[0]?.Id || '',
    LocationName: career.Location?.[0]?.Title || '',
    EmploymentType: normalizeEmploymentType(career.EmploymentType),
    PostedAtUtc: postedAtUtc,
    PostedAgoDays: daysSinceUtc(postedAtUtc),
    DetailUrl: career.DetailUrl || '',
    ApplyUrl: career.ApplyUrl || '',
  };
}

const mapItemToJob = (item: CareersItem): Job => ({
  id: item.Id,
  title: item.Title,
  location: item.LocationName,
  department: item.DepartmentName,
  departmentId: item.DepartmentId,
  workType: item.EmploymentType || 'Full-time',
  postedDaysAgo: item.PostedAgoDays ?? 0,
});

function buildFacets(
  items: CareersItem[],
  selected: { locationNames: string[]; departmentNames: string[] },
): { locations: CareersFiltration[]; departments: CareersFiltration[] } {
  const makeFacetList = (pick: (i: CareersItem) => string, selectedNames: string[]) => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const key = pick(item);
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts]
      .map(([name, count]) => ({ name, count, selected: selectedNames.includes(name) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  return {
    locations: makeFacetList((i) => i.LocationName, selected.locationNames),
    departments: makeFacetList((i) => i.DepartmentName, selected.departmentNames),
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
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="mb-6 text-default">{title}</h3>
        <button
          type="button"
          onClick={onToggle}
          className="grid h-6 w-6 place-items-center rounded-md border bg-primary text-xs text-white"
          aria-expanded={isOpen}
          aria-controls={bodyId}
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      <div id={bodyId} className={`font-semibold ${isOpen ? 'block' : 'hidden'}`}>
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
    <li className="flex items-center gap-2">
      <input
        type="checkbox"
        className="checkbox checkbox-sm"
        checked={facet.selected}
        onChange={() => onToggle(facet.name)}
      />
      <span className="text-sm">{facet.name}</span>
      <span className="ml-auto text-xs tabular-nums text-gray-500">{facet.count}</span>
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
  const items = useMemo(() => (careers || []).map(mapCareerToItem), [careers]);

  const vacanciesLabel = labels?.vacanciesLabel ?? 'Available vacancies';
  const locationLabel = labels?.locationLabel ?? 'Filter by Location';
  const departmentLabel = labels?.departmentLabel ?? 'Filter by Department';

  // Applied query (controls the list)
  const [query, setQuery] = useState<CareersSearchBody>({ ...DEFAULT_SEARCH, ...initialBody });
  // Draft filters (UI state only; does not affect list until Apply)
  const [draft, setDraft] = useState<CareersSearchBody>({ ...DEFAULT_SEARCH, ...initialBody });

  // Facets reflect the DRAFT selection so the checkboxes show what the user has picked
  const { locations: locationFacets, departments: departmentFacets } = useMemo(
    () =>
      buildFacets(items, {
        locationNames: draft.locationNames,
        departmentNames: draft.departmentNames,
      }),
    [items, draft.locationNames, draft.departmentNames],
  );

  // Listing uses APPLIED query only
  const { pageItems, totalResults, totalPages, page } = useMemo(() => {
    const toSet = (arr: string[]) => new Set(arr.map((x) => x.toLowerCase()));
    const inSet = (s: Set<string>, v: string) => s.has((v || '').toLowerCase());
    const hasText = (s?: string | null) => !!s && s.trim().length > 0;
    const byDate = (date?: string) => +new Date(date || 0);

    let arr = items;

    if (query.locationNames?.length) {
      const want = toSet(query.locationNames);
      arr = arr.filter((i) => inSet(want, i.LocationName));
    }
    if (query.departmentNames?.length) {
      const want = toSet(query.departmentNames);
      arr = arr.filter((i) => inSet(want, i.DepartmentName));
    }
    if (hasText(query.search)) {
      const needle = query.search!.toLowerCase();
      arr = arr.filter(
        (i) =>
          i.Title.toLowerCase().includes(needle) ||
          i.DepartmentName.toLowerCase().includes(needle) ||
          i.LocationName.toLowerCase().includes(needle),
      );
    }

    arr = arr
      .slice()
      .sort((a, b) =>
        query.sort === 'postedAt_asc'
          ? byDate(a.PostedAtUtc) - byDate(b.PostedAtUtc)
          : byDate(b.PostedAtUtc) - byDate(a.PostedAtUtc),
      );

    const totalResults = arr.length;
    const pageSize = Math.max(1, query.pageSize || 9);
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    const safePage = Math.min(Math.max(1, query.page || 1), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      pageItems: arr.slice(start, start + pageSize),
      totalResults,
      totalPages,
      page: safePage,
    };
  }, [items, query]);

  const jobs = useMemo(() => pageItems.map(mapItemToJob), [pageItems]);

  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  type QueryKey = 'locationNames' | 'departmentNames';

  // Toggle affects DRAFT only
  const toggleSingleFacet = useCallback((key: QueryKey, name: string) => {
    setDraft((d) => ({ ...d, page: 1, [key]: d[key][0] === name ? [] : [name] }));
  }, []);

  const clearFacet = useCallback((key: QueryKey, name: string) => {
    setDraft((d) => ({ ...d, page: 1, [key]: d[key].filter((n) => n !== name) }));
  }, []);

  // Pagination affects APPLIED query (listing)
  const handlePage = useCallback(
    (numberOfPage: number) =>
      setQuery((q) => ({
        ...q,
        page: Math.max(1, Math.min(numberOfPage, Math.max(1, totalPages))),
      })),
    [totalPages],
  );

  const handlePageSize = useCallback(
    (n: number) => setQuery((q) => ({ ...q, page: 1, pageSize: n })),
    [],
  );

  // Chips reflect DRAFT (what user is currently choosing)
  const selectedChips = useMemo(
    () => [
      ...draft.locationNames.map((name) => ({ key: 'locationNames' as QueryKey, name })),
      ...draft.departmentNames.map((name) => ({ key: 'departmentNames' as QueryKey, name })),
    ],
    [draft.locationNames, draft.departmentNames],
  );

  // Clear only resets DRAFT
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

  if (jobs.length === 0) return <EmptyState />;

  return (
    <section className={`mx-auto py-10 md:px-10 ${className ?? ''}`}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Sidebar (md+) */}
        <aside className="hidden md:flex md:flex-col basis-1/4 min-w-0 space-y-6">
          <FilterSection
            title={locationLabel}
            isOpen={isLocationOpen}
            onToggle={() => setIsLocationOpen((v) => !v)}
            bodyId="filter-body-locations"
          >
            <ul className="max-h-80 space-y-2 overflow-auto pr-1">
              {locationFacets.map((f) => (
                <FacetCheckbox
                  key={f.name}
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
            bodyId="filter-body-departments"
          >
            <ul className="max-h-80 space-y-2 overflow-auto pr-1">
              {departmentFacets.map((f) => (
                <FacetCheckbox
                  key={f.name}
                  facet={f}
                  onToggle={(name) => toggleSingleFacet('departmentNames', name)}
                />
              ))}
            </ul>
          </FilterSection>

          {/* Desktop controls: Clear / Apply */}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex-1 rounded-xl border px-4 py-2"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setQuery((q) => ({ ...q, ...draft, page: 1 }))}
              className="flex-1 rounded-xl bg-primary px-4 py-2 text-white"
            >
              Apply
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 max-w-[888px] flex min-h-[600px] flex-col gap-4">
          {/* Header + mobile filter button */}
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl md:text-28px font-semibold text-[#212121] md:text-primary">
              {vacanciesLabel}
            </h2>
            <button
              type="button"
              className="md:hidden grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white"
              onClick={() => {
                // snapshot applied -> draft before opening
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
              />
            </button>
          </div>

          {/* Selected filter chips in mobile screen (reflect DRAFT) */}
          {selectedChips.length > 0 && (
            <div className="-mx-2 md:mx-0 md:hidden">
              <div className="flex flex-nowrap gap-2 overflow-x-auto px-2 pb-2">
                {selectedChips.map((c) => (
                  <button
                    key={`${c.key}:${c.name}`}
                    onClick={() => clearFacet(c.key, c.name)}
                    className="shrink-0 rounded-full border border-primary/20 bg-[#E6F3F8] px-4 py-2 text-14px text-[#0045AB]"
                  >
                    {c.name} <span className="pl-1.5">×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cards */}
          <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="h-[218px]">
                <JobCard job={job} onOpen={() => onOpenJob?.(job.id, job.departmentId)} />
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalResults={totalResults}
            pageSize={query.pageSize}
            onPage={handlePage}
            onPageSize={handlePageSize}
          />
        </div>
      </div>

      {/* Mobile filters bottom sheet */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-auto rounded-t-2xl bg-[#EEEEEE] p-5">
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
                onClick={clearAllFilters} // clears DRAFT only
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
                className="w-full rounded-2xl bg-primary px-4 py-2 text-white"
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

