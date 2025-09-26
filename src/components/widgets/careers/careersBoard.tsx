'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import JobCard from '../../atoms/jobCard/jobCard';

type Labels = {
  vacanciesLabel?: string;
  locationLabel?: string;
  departmentLabel?: string;
};

type ModuleCareer = {
  Id: string;
  Title?: string;
  EmploymentType?: string;
  Date?: string;
  Department?: { Id?: string; Title?: string } | { Id?: string; Title?: string }[] | null;
  Location?: { Title?: string } | { Title?: string }[] | null;
  DetailUrl?: string;
  ApplyUrl?: string;
};

export type Job = {
  id: string;
  title: string;
  location: string;
  department: string;
  departmentId: string;
  workType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | string;
  postedDaysAgo: number;
};

type CareersFacet = { name: string; count: number; selected: boolean };

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

type Props = {
  labels: Labels;
  careers: ModuleCareer[];
  onOpenJob?: (id: string, departmentId: string) => void;
  className?: string;
  initialBody?: Partial<CareersSearchBody>;
};

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  '1': 'Full-time',
  '2': 'Part-time',
};

function normalizeEmploymentType(raw?: string): string {
  if (!raw) return '';
  const key = String(raw).trim();
  return EMPLOYMENT_TYPE_MAP[key] ?? key;
}

function daysAgoFromUtc(utc?: string): number {
  if (!utc) return 0;
  const t = new Date(utc).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function pickFirst<T = any>(val: any): T | null {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

function mapCareerToItem(c: ModuleCareer): CareersItem {
  const department = pickFirst<{ Id?: string; Title?: string }>(c?.Department);
  const location = pickFirst<{ Title?: string }>(c?.Location);
  const postedAt = c?.Date || '';

  return {
    Id: c.Id,
    Title: c.Title || '',
    DepartmentName: department?.Title || '',
    DepartmentId: department?.Id || '',
    LocationName: location?.Title || '',
    EmploymentType: normalizeEmploymentType(c?.EmploymentType),
    PostedAtUtc: postedAt,
    PostedAgoDays: daysAgoFromUtc(postedAt),
    DetailUrl: c.DetailUrl || '',
    ApplyUrl: c.ApplyUrl || '',
  };
}

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

function buildFacets(items: CareersItem[]) {
  const locationCounts = new Map<string, number>();
  const departmentCounts = new Map<string, number>();

  for (const item of items) {
    if (item.LocationName)
      locationCounts.set(item.LocationName, (locationCounts.get(item.LocationName) ?? 0) + 1);
    if (item.DepartmentName)
      departmentCounts.set(
        item.DepartmentName,
        (departmentCounts.get(item.DepartmentName) ?? 0) + 1,
      );
  }

  const locations: CareersFacet[] = Array.from(locationCounts, ([name, count]) => ({
    name,
    count,
    selected: false,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const departments: CareersFacet[] = Array.from(departmentCounts, ([name, count]) => ({
    name,
    count,
    selected: false,
  })).sort((a, b) => a.name.localeCompare(b.name));

  return { locations, departments };
}

function mergeFacets(
  allNames: string[],
  currentFacets: CareersFacet[] = [],
  selectedNames: string[] = [],
): CareersFacet[] {
  const counts = new Map(currentFacets.map((f) => [f.name, f.count] as const));
  return allNames.map((name) => ({
    name,
    count: counts.get(name) ?? 0,
    selected: selectedNames.includes(name),
  }));
}

function unionNames(prev: string[], next: CareersFacet[] = []) {
  const set = new Set(prev);
  for (const facet of next) set.add(facet.name);
  return Array.from(set);
}

function filterSortPaginate(items: CareersItem[], query: CareersSearchBody) {
  let filtered = items;

  if (query.locationNames.length) {
    const s = new Set(query.locationNames.map((x) => x.toLowerCase()));
    filtered = filtered.filter((i) => s.has(i.LocationName.toLowerCase()));
  }
  if (query.departmentNames.length) {
    const s = new Set(query.departmentNames.map((x) => x.toLowerCase()));
    filtered = filtered.filter((i) => s.has(i.DepartmentName.toLowerCase()));
  }
  if (query.search && query.search.trim().length) {
    const q = query.search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.Title.toLowerCase().includes(q) ||
        i.DepartmentName.toLowerCase().includes(q) ||
        i.LocationName.toLowerCase().includes(q),
    );
  }

  filtered = [...filtered].sort((a, b) => {
    const ta = new Date(a.PostedAtUtc || 0).getTime();
    const tb = new Date(b.PostedAtUtc || 0).getTime();
    return query.sort === 'postedAt_asc' ? ta - tb : tb - ta;
  });

  const totalResults = filtered.length;
  const pageSize = Math.max(1, query.pageSize);
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return { pageItems, totalResults, totalPages };
}

// ---------- UI helpers ----------
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

export default function CareersBoard({
  labels,
  careers,
  onOpenJob,
  initialBody,
  className,
}: Props) {
  const baseItems = useMemo<CareersItem[]>(() => (careers || []).map(mapCareerToItem), [careers]);

  const vacanciesLabel = labels?.vacanciesLabel ?? 'Available vacancies';
  const locationLabel = labels?.locationLabel ?? 'Filter by Location';
  const departmentLabel = labels?.departmentLabel ?? 'Filter by Department';

  const [query, setQuery] = useState<CareersSearchBody>({
    page: 1,
    pageSize: 9,
    departmentNames: [],
    locationNames: [],
    sort: 'postedAt_desc',
    language: 'en',
    search: null,
    ...(initialBody || {}),
  });

  const allFacets = useMemo(() => buildFacets(baseItems), [baseItems]);
  const locations = allFacets.locations;
  const departments = allFacets.departments;

  const [locationNames, setLocationNames] = useState<string[]>(
    locations.map((facet) => facet.name),
  );
  const [departmentNames, setDepartmentNames] = useState<string[]>(
    departments.map((facet) => facet.name),
  );

  useEffect(() => {
    setLocationNames((previous) => unionNames(previous, locations));
    setDepartmentNames((previous) => unionNames(previous, departments));
  }, [locations, departments]);

  const displayLocations = useMemo(
    () => mergeFacets(locationNames, locations, query.locationNames),
    [locationNames, locations, query.locationNames],
  );
  const displayDepartments = useMemo(
    () => mergeFacets(departmentNames, departments, query.departmentNames),
    [departmentNames, departments, query.departmentNames],
  );

  const { pageItems, totalResults, totalPages } = useMemo(
    () => filterSortPaginate(baseItems, query),
    [baseItems, query],
  );

  const displayTotalPages = Math.max(1, totalPages);
  const pageDisplay = Math.min(query.page, displayTotalPages);

  const jobs = useMemo(() => pageItems.map(mapItemToJob), [pageItems]);

  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(true);

  const toggleLocation = useCallback((location: string) => {
    setQuery((query) => {
      const isActive = query.locationNames[0] === location;
      return { ...query, page: 1, locationNames: isActive ? [] : [location] };
    });
  }, []);

  const toggleDepartment = useCallback((departmentName: string) => {
    setQuery((query) => {
      const isActive = query.departmentNames[0] === departmentName;
      return { ...query, page: 1, departmentNames: isActive ? [] : [departmentName] };
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

  return (
    <section className={`w-full py-16 px-20 ${className ?? ''}`}>
      <div className="grid grid-cols-[16rem_minmax(0,1fr)] gap-8">
        {/* Sidebar */}
        <aside className="min-w-0 max-w-xs space-y-6">
          <FilterSection
            title={locationLabel}
            onClear={() => setQuery((q) => ({ ...q, page: 1, locationNames: [] }))}
            hasActive={query.locationNames.length > 0}
            isOpen={isLocationOpen}
            onToggle={() => setIsLocationOpen((o) => !o)}
            bodyId="filter-body-locations"
          >
            <ul className="max-h-80 space-y-2 overflow-auto pr-1">
              {displayLocations.map((location) => (
                <li key={location.name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={location.selected}
                    onChange={() => toggleLocation(location.name)}
                  />
                  <span className="text-sm">{location.name}</span>
                  <span className="ml-auto text-xs tabular-nums text-gray-500">
                    {location.count}
                  </span>
                </li>
              ))}
            </ul>
          </FilterSection>

          <FilterSection
            title={departmentLabel}
            onClear={() => setQuery((q) => ({ ...q, page: 1, departmentNames: [] }))}
            hasActive={query.departmentNames.length > 0}
            isOpen={isDepartmentOpen}
            onToggle={() => setIsDepartmentOpen((o) => !o)}
            bodyId="filter-body-departments"
          >
            <ul className="max-h-80 space-y-2 overflow-auto pr-1">
              {displayDepartments.map((department) => (
                <li key={department.name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={department.selected}
                    onChange={() => toggleDepartment(department.name)}
                  />
                  <span className="text-sm">{department.name}</span>
                  <span className="ml-auto text-xs tabular-nums text-gray-500">
                    {department.count}
                  </span>
                </li>
              ))}
            </ul>
          </FilterSection>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 max-w-4xl flex-col gap-4" style={{ minHeight: '700px' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="mb-8 text-28px font-semibold text-primary">{vacanciesLabel}</h2>
          </div>

          {jobs.length === 0 ? (
            <NoJobsAvailable />
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="h-[218px]">
                  <JobCard job={job} onOpen={() => onOpenJob?.(job.id, job.departmentId)} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination with combined buttons */}
          <div className="mt-auto flex w-full flex-wrap items-center justify-between rounded-2xl bg-white py-2 px-6">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                Display
                <select
                  value={query.pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-md border px-2 py-1"
                >
                  {[9, 12, 15, 25].map((number) => (
                    <option key={number} value={number}>
                      {number}
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
              {/* Left control: First + Previous (click = prev, double = first) */}
              <button
                onClick={() => pageDisplay > 1 && setPage(pageDisplay - 1)}
                onDoubleClick={() => setPage(1)}
                disabled={pageDisplay <= 1}
                className="flex items-center gap-1 rounded-full border px-3 py-2 disabled:opacity-40"
                aria-label="First / Previous"
              >
                <Image
                  src="/icons/arrow-double-left.png"
                  alt="First"
                  width={20}
                  height={20}
                  className="opacity-70"
                />
                <Image
                  src="/icons/arrow-single-left.png"
                  alt="Previous"
                  width={20}
                  height={20}
                  className="opacity-70"
                />
              </button>

              {/* Page numbers (windowed) */}
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
                      className={`rounded-full border px-3 py-1 ${isActive ? 'border-primary bg-primary text-white' : ''}`}
                    >
                      {num}
                    </button>
                  );
                })}

              {/* Right control: Next + Last (click = next, double = last) */}
              <button
                onClick={() => pageDisplay < displayTotalPages && setPage(pageDisplay + 1)}
                onDoubleClick={() => setPage(displayTotalPages)}
                disabled={pageDisplay >= displayTotalPages}
                className="flex items-center gap-1 rounded-full border px-3 py-2 disabled:opacity-40"
                aria-label="Next / Last"
              >
                <Image
                  src="/icons/arrow-single-right.png"
                  alt="Next"
                  width={20}
                  height={20}
                  className="opacity-70"
                />
                <Image
                  src="/icons/arrow-double-right.png"
                  alt="Last"
                  width={20}
                  height={20}
                  className="opacity-70"
                />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

