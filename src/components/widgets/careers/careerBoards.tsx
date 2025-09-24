'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import JobCard from '../../atoms/jobCard/jobCard';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';

export type Job = {
  id: string;
  title: string;
  location: string;
  department: string;
  departmentId: string;
  workType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | string;
  postedDaysAgo: number;
};

type CareersFacet = { Name: string; Count: number; Selected: boolean };

type CareersItem = {
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

type CareersResponse = {
  Success: boolean;
  Error: string | null;
  Data: {
    ItemDefaultUrl: string;
    VacanciesLabel: string;
    LocationLabel: string;
    DepartmentLabel: string;
    Title: string;
    Provider: string;
    Page: number;
    PageSize: number;
    TotalResults: number;
    TotalPages: number;
    AppliedFilters: {
      DepartmentNames: string[];
      LocationNames: string[];
      Search: string | null;
      Sort: 'postedAt_desc' | 'postedAt_asc';
      Language: string;
    };
    Facets: {
      Locations: CareersFacet[];
      Departments: CareersFacet[];
    };
    Items: CareersItem[];
  };
  TraceId?: string;
};

function mapItemToJob(item: CareersItem): Job {
  return {
    id: item.Id,
    title: item.Title,
    location: item.LocationName,
    department: item.DepartmentName,
    departmentId: item.DepartmentId,
    workType: item.EmploymentType || 'Full-time',
    postedDaysAgo: item.PostedAgoDays ?? 0,
  };
}

function unionNames(prev: string[], next: CareersFacet[] = []) {
  const set = new Set(prev);
  for (const f of next) set.add(f.Name);
  return Array.from(set);
}

function mergeFacets(
  allNames: string[],
  currentFacets: CareersFacet[] = [],
  selectedNames: string[] = [],
): CareersFacet[] {
  const counts = new Map(currentFacets.map((f) => [f.Name, f.Count] as const));
  return allNames.map((name) => ({
    Name: name,
    Count: counts.get(name) ?? 0,
    Selected: selectedNames.includes(name),
  }));
}

function NoJobsAvailable() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
      <Image
        src="/icons/file-search.png"
        alt="No jobs available"
        width={64}
        height={64}
        className="mb-6 opacity-70"
      />
      <h2 className="text-xl font-semibold text-default">Currently No Open Positions</h2>
      <p className="mt-2 max-w-md text-sm text-default">
        We&apos;ll update this page as soon as new vacancies become available
      </p>
    </div>
  );
}

function FilterSection({
  title,
  children,
  onClear,
  hasActive,
  isOpen = true,
  onToggle,
  bodyId,
}: {
  title: string;
  children: React.ReactNode;
  onClear?: () => void;
  hasActive?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  bodyId?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="mb-6 text-default">{title}</h3>

        <div className="flex items-center gap-3">
          {hasActive ? (
            <button className="text-xs text-gray-600 underline" onClick={onClear}>
              Clear
            </button>
          ) : null}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="w-[24px] h-[24px] rounded-md border px-2 py-1 text-xs text-white bg-primary"
              aria-expanded={isOpen}
              aria-controls={bodyId}
            >
              {isOpen ? '+' : '-'}
            </button>
          )}
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

type Props = {
  initial?: CareersResponse;
  initialBody?: CareersSearchBody;
  onOpenJob?: (id: string, departmentId: string) => void;
  dir?: 'rtl' | 'ltr' | 'auto';
  className?: string;
};

export default function CareersBoard({
  initial,
  onOpenJob,
  initialBody = {
    page: 1,
    pageSize: 9,
    departmentNames: [],
    locationNames: [],
    sort: 'postedAt_desc',
    language: 'en',
  },
  dir = 'ltr',
  className,
}: Props) {
  const { post } = useSfMutation('api/default/careers/search');

  const [query, setQuery] = useState<CareersSearchBody>(initialBody);
  const [data, setData] = useState<CareersResponse | undefined>(initial);
  const [loading, setLoading] = useState<boolean>(!initial);
  const [error, setError] = useState<string | null>(null);

  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(true);

  const [allLocationNames, setAllLocationNames] = useState<string[]>(
    initial?.Data?.Facets?.Locations?.map((f) => f.Name) ?? [],
  );
  const [allDepartmentNames, setAllDepartmentNames] = useState<string[]>(
    initial?.Data?.Facets?.Departments?.map((f) => f.Name) ?? [],
  );

  const items = data?.Data?.Items ?? [];
  const jobs: Job[] = useMemo(() => items.map(mapItemToJob), [items]);

  const vacanciesLabel = data?.Data?.VacanciesLabel ?? 'Available vacancies';
  const locationLabel = data?.Data?.LocationLabel ?? 'Filter by Location';
  const departmentLabel = data?.Data?.DepartmentLabel ?? 'Filter by Department';

  const facetsLocation = data?.Data?.Facets?.Locations ?? [];
  const facetsDepartment = data?.Data?.Facets?.Departments ?? [];

  const { totalResults, totalPages, displayTotalPages } = useMemo(() => {
    const rawTotalResults = data?.Data?.TotalResults ?? 0;
    const rawTotalPages = data?.Data?.TotalPages ?? 0;
    const pageSize = data?.Data?.PageSize ?? query.pageSize;
    const computedPages =
      rawTotalResults > 0 ? Math.ceil(rawTotalResults / Math.max(1, pageSize)) : 0;
    const safeTotalPages = Math.max(rawTotalPages, computedPages);
    return {
      totalResults: rawTotalResults,
      totalPages: safeTotalPages,
      displayTotalPages: Math.max(1, safeTotalPages),
    };
  }, [data?.Data?.TotalResults, data?.Data?.TotalPages, data?.Data?.PageSize, query.pageSize]);

  const displayLocations = useMemo(
    () => mergeFacets(allLocationNames, facetsLocation, query.locationNames),
    [allLocationNames, facetsLocation, query.locationNames],
  );
  const displayDepartments = useMemo(
    () => mergeFacets(allDepartmentNames, facetsDepartment, query.departmentNames),
    [allDepartmentNames, facetsDepartment, query.departmentNames],
  );

  useEffect(() => {
    if (!data?.Data?.Facets) return;
    setAllLocationNames((prev) => unionNames(prev, data.Data.Facets.Locations));
    setAllDepartmentNames((prev) => unionNames(prev, data.Data.Facets.Departments));
  }, [data?.Data?.Facets]);

  const queryKey = useMemo(() => JSON.stringify(query), [query]);
  const lastKeyRef = useRef<string | null>(initial ? JSON.stringify(initialBody) : null);

  useEffect(() => {
    if (lastKeyRef.current === queryKey) return;

    let cancelled = false;

    const fetchCareers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response: CareersResponse = await post(query);
        if (!cancelled) {
          setData(response);
          lastKeyRef.current = queryKey;
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load careers.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCareers();

    return () => {
      cancelled = true;
    };
  }, [post, queryKey]);

  useEffect(() => {
    if (loading) return;

    const MIN_PAGE = 1;
    const maxPage = Math.max(MIN_PAGE, totalPages);
    const clampedPage = Math.min(Math.max(query.page, MIN_PAGE), maxPage);

    if (clampedPage !== query.page) {
      setQuery((q) => ({ ...q, page: clampedPage }));
    }
  }, [loading, query.page, totalPages]);

  const toggleLocation = useCallback((location: string) => {
    setQuery((query) => {
      const isActive = query.locationNames[0] === location;
      return { ...query, locationNames: isActive ? [] : [location] };
    });
  }, []);

  const toggleDepartment = useCallback((departmentName: string) => {
    setQuery((query) => {
      const isActive = query.departmentNames[0] === departmentName;
      return { ...query, departmentNames: isActive ? [] : [departmentName] };
    });
  }, []);

  const setPage = useCallback(
    (page: number) => {
      setQuery((query) => ({ ...query, page: Math.max(1, Math.min(page, displayTotalPages)) }));
    },
    [displayTotalPages],
  );

  const setPageSize = useCallback((pageSize: number) => {
    setQuery((query) => ({ ...query, page: 1, pageSize }));
  }, []);

  const pageDisplay = Math.min(query.page, displayTotalPages);

  return (
    <section dir={dir} className={`w-full py-16 px-20 ${className ?? ''}`}>
      <div className="grid grid-cols-[16rem_minmax(0,1fr)] gap-8">
        {/* Sidebar Filters */}
        <aside className="min-w-0 max-w-xs space-y-6">
          {/* Filter by Location (with its own collapse) */}
          <FilterSection
            title={locationLabel}
            onClear={() => setQuery((q) => ({ ...q, locationNames: [] }))}
            hasActive={query.locationNames.length > 0}
            isOpen={isLocationOpen}
            onToggle={() => setIsLocationOpen((o) => !o)}
            bodyId="filter-body-locations"
          >
            <ul className="max-h-80 space-y-2 overflow-auto pr-1">
              {displayLocations.map((location) => (
                <li key={location.Name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={location.Selected}
                    onChange={() => toggleLocation(location.Name)}
                  />
                  <span className="text-sm">{location.Name}</span>
                  <span className="ml-auto text-xs tabular-nums text-gray-500">
                    {location.Count}
                  </span>
                </li>
              ))}
            </ul>
          </FilterSection>

          {/* Filter by Department (with its own collapse) */}
          <FilterSection
            title={departmentLabel}
            onClear={() => setQuery((q) => ({ ...q, departmentNames: [] }))}
            hasActive={query.departmentNames.length > 0}
            isOpen={isDepartmentOpen}
            onToggle={() => setIsDepartmentOpen((o) => !o)}
            bodyId="filter-body-departments"
          >
            <ul className="max-h-80 space-y-2 overflow-auto pr-1">
              {displayDepartments.map((department) => (
                <li key={department.Name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={department.Selected}
                    onChange={() => toggleDepartment(department.Name)}
                  />
                  <span className="text-sm">{department.Name}</span>
                  <span className="ml-auto text-xs tabular-nums text-gray-500">
                    {department.Count}
                  </span>
                </li>
              ))}
            </ul>
          </FilterSection>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 max-w-4xl flex-col gap-4" style={{ minHeight: '700px' }}>
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="mb-8 text-28px font-semibold text-primary">{vacanciesLabel}</h2>
          </div>

          {/* States */}
          {loading && <div className="grid place-items-center py-16 text-gray-500">Loading…</div>}
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Jobs grid */}
          {!loading &&
            !error &&
            (jobs.length === 0 ? (
              <NoJobsAvailable />
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {jobs.map((job) => (
                  <div key={job.id} className="h-[218px]">
                    <JobCard job={job} onOpen={() => onOpenJob?.(job.id, job.departmentId)} />
                  </div>
                ))}
              </div>
            ))}

          {/* Pagination */}
          {!error && (
            <div className="mt-auto flex w-full flex-wrap items-center justify-between rounded-2xl bg-white py-2 px-6">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  Display
                  <select
                    value={query.pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded-md border px-2 py-1"
                  >
                    {[9, 12, 15, 25].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="text-sm text-gray-600">
                  {totalResults} result{totalResults !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                Page {pageDisplay} of {displayTotalPages}
              </div>

              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={pageDisplay <= 1}
                  className="rounded-full border px-3 py-2 disabled:opacity-40"
                  aria-label="First page"
                >
                  <Image src="/icons/arrow-double-left.png" alt="First" width={20} height={20} />
                </button>
                <button
                  onClick={() => setPage(pageDisplay - 1)}
                  disabled={pageDisplay <= 1}
                  className="rounded-full border px-3 py-2 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <Image src="/icons/arrow-single-left.png" alt="Previous" width={20} height={20} />
                </button>

                {Array.from({ length: displayTotalPages })
                  .slice(Math.max(0, pageDisplay - 3), Math.max(0, pageDisplay - 3) + 5)
                  .map((_, idx) => {
                    const start = Math.max(1, pageDisplay - 2);
                    const num = start + idx;
                    if (num > displayTotalPages) return null;
                    const isActive = num === pageDisplay;
                    return (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`rounded-full border px-3 py-1 ${
                          isActive ? 'border-primary bg-primary text-white' : ''
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}

                <button
                  onClick={() => setPage(pageDisplay + 1)}
                  disabled={pageDisplay >= displayTotalPages}
                  className="rounded-full border px-3 py-2 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <Image src="/icons/arrow-single-right.png" alt="Next" width={20} height={20} />
                </button>
                <button
                  onClick={() => setPage(displayTotalPages)}
                  disabled={pageDisplay >= displayTotalPages}
                  className="rounded-full border px-3 py-2 disabled:opacity-40"
                  aria-label="Last page"
                >
                  <Image src="/icons/arrow-double-right.png" alt="Last" width={20} height={20} />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

