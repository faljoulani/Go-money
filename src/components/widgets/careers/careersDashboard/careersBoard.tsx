'use client';

import React, { useCallback, useMemo, useState } from 'react';
import EmptyState from './noCareers';
import JobCard from '../../../atoms/jobCard/jobCard';
import Pagination from './pagination';
import { daysSinceUtc } from '../../../../utils/utils';
import { useDirection } from '../../../../utils/helpers';

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

function mapCareerToItem(c: ModuleCareer, lang: 'ar' | 'en'): CareersItem {
  const postedAtUtc = c.Date || '';
  return {
    Id: c.Id,
    Title: c.Title || '',
    DepartmentName: c.Department?.[0]?.Title || '',
    DepartmentId: c.Department?.[0]?.Id || '',
    LocationName: c.Location?.[0]?.Title || '',
    EmploymentType: c.EmploymentType || '',
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

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {children}
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
    <li className="flex items-center gap-2 py-1">
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

  const { locations: locationFacets, departments: departmentFacets } = useMemo(
    () =>
      buildFacets(allItems, {
        locationNames: query.locationNames,
        departmentNames: query.departmentNames,
      }),
    [allItems, query.locationNames, query.departmentNames],
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

  return (
    <section className={`mx-auto py-10 md:px-10 ${className ?? ''}`}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Sidebar filters (md+) */}
        <aside className="hidden md:flex md:flex-col basis-1/4 min-w-0 space-y-6">
          <FilterSection title={locationLabel}>
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

          <FilterSection title={departmentLabel}>
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
          <h2 className="text-2xl md:text-28px font-semibold text-[#212121] md:text-primary">
            {labels?.vacanciesLabel ?? 'Available vacancies'}
          </h2>

          {!hasResults ? (
            <EmptyState />
          ) : (
            <>
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
    </section>
  );
}

