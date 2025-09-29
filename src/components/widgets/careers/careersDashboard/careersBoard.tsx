'use client';

import React, { useCallback, useMemo, useState } from 'react';
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
} from '../../../../types/Type';

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
    locations: makeFacetList((item) => item.LocationName, selected.locationNames),
    departments: makeFacetList((item) => item.DepartmentName, selected.departmentNames),
  };
}

function filterSortPaginate(items: CareersItem[], query: CareersSearchBody) {
  const toSet = (arr: string[]) => new Set(arr.map((x) => x.toLowerCase()));
  const inSet = (s: Set<string>, v: string) => s.has(v.toLowerCase());
  const hasText = (s?: string | null) => !!s && s.trim().length > 0;

  let filtered = items;

  if (query.locationNames.length) {
    const want = toSet(query.locationNames);
    filtered = filtered.filter((i) => inSet(want, i.LocationName));
  }

  if (query.departmentNames.length) {
    const want = toSet(query.departmentNames);
    filtered = filtered.filter((i) => inSet(want, i.DepartmentName));
  }

  if (hasText(query.search)) {
    const needle = query.search!.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.Title.toLowerCase().includes(needle) ||
        item.DepartmentName.toLowerCase().includes(needle) ||
        item.LocationName.toLowerCase().includes(needle),
    );
  }

  const byDate = (date?: string) => +new Date(date || 0);
  filtered = filtered
    .slice()
    .sort((a, b) =>
      query.sort === 'postedAt_asc'
        ? byDate(a.PostedAtUtc) - byDate(b.PostedAtUtc)
        : byDate(b.PostedAtUtc) - byDate(a.PostedAtUtc),
    );

  const totalResults = filtered.length;
  const pageSize = Math.max(1, query.pageSize);
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const start = (page - 1) * pageSize;

  return { pageItems: filtered.slice(start, start + pageSize), totalResults, totalPages, page };
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="h-6 w-6 rounded-md border text-xs text-white bg-primary"
            aria-expanded={isOpen}
            aria-controls={bodyId}
          >
            {isOpen ? '−' : '+'}
          </button>
        </div>
      </div>
      <div
        id={bodyId}
        className={`font-semibold transition-all duration-200 ${isOpen ? 'block' : 'hidden'}`}
      >
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

  const [query, setQuery] = useState<CareersSearchBody>({ ...DEFAULT_SEARCH, ...initialBody });

  const { locations: locationFacets, departments: departmentFacets } = useMemo(
    () =>
      buildFacets(items, {
        locationNames: query.locationNames,
        departmentNames: query.departmentNames,
      }),
    [items, query.locationNames, query.departmentNames],
  );

  const { pageItems, totalResults, totalPages, page } = useMemo(
    () => filterSortPaginate(items, query),
    [items, query],
  );

  const jobs = useMemo(() => pageItems.map(mapItemToJob), [pageItems]);
  //const jobs = [];
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(true);

  type QueryKey = 'locationNames' | 'departmentNames';

  const toggleSingleFacet = useCallback((key: QueryKey, name: string) => {
    setQuery((query) => ({ ...query, page: 1, [key]: query[key][0] === name ? [] : [name] }));
  }, []);

  const handlePage = useCallback(
    (n: number) =>
      setQuery((query) => ({ ...query, page: Math.max(1, Math.min(n, Math.max(1, totalPages))) })),
    [totalPages],
  );

  const handlePageSize = useCallback(
    (n: number) => setQuery((query) => ({ ...query, page: 1, pageSize: n })),
    [],
  );

  if (jobs.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className={`mx-auto py-16 px-20 ${className ?? ''}`}>
      <div className="grid grid-cols-[16rem_minmax(0,1fr)] gap-8">
        {/* Sidebar */}
        <aside className="basis-1/4 shrink-0 min-w-0 space-y-6">
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
        </aside>

        {/* Main*/}
        <div className="min-w-0 max-w-[888px] flex min-h-[600px] flex-col gap-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="mb-8 text-28px font-semibold text-primary">{vacanciesLabel}</h2>
          </div>

          {/* Cards */}
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div key={job.id} className="h-[218px]">
                  <JobCard job={job} onOpen={() => onOpenJob?.(job.id, job.departmentId)} />
                </div>
              ))}
            </div>
          </div>

          {/* Spacer to keep pagination pinned to bottom */}
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
    </section>
  );
}

