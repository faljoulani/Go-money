'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import JobCard from '../../atoms/jobCard/jobCard';
export type Job = {
  id: string;
  title: string;
  location: string;
  department: string;
  workType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  postedDaysAgo: number;
};

type Props = {
  jobs?: Job[];
  initialPageSize?: number;
  dir?: 'rtl' | 'ltr' | 'auto';
  className?: string;
};

const STATIC_JOBS: Job[] = [
  {
    id: '1',
    title: 'UX/UI Designer',
    location: 'Riyadh, Saudi Arabia',
    department: 'Design',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '2',
    title: 'Backend Developer',
    location: 'Riyadh, Saudi Arabia',
    department: 'Engineering',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '3',
    title: 'Marketing Specialist',
    location: 'Cairo, Egypt',
    department: 'Marketing',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '4',
    title: 'Data Analyst',
    location: 'Dubai, UAE',
    department: 'Product Management',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '5',
    title: 'Frontend Engineer',
    location: 'San Francisco, USA',
    department: 'Engineering',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '6',
    title: 'Finance Officer',
    location: 'London, UK',
    department: 'Customer Support',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '7',
    title: 'Digital Product Manager',
    location: 'Jeddah, Saudi Arabia',
    department: 'Product Management',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '8',
    title: 'QA Engineer',
    location: 'Manchester, UK',
    department: 'Engineering',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '9',
    title: 'Visual Designer',
    location: 'Remote',
    department: 'Design',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '10',
    title: 'Software Engineer',
    location: 'Riyadh, Saudi Arabia',
    department: 'Engineering',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '11',
    title: 'Business Analyst',
    location: 'New York, USA',
    department: 'Product Management',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '12',
    title: 'Copywriter',
    location: 'Dubai, UAE',
    department: 'Marketing',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  // add more if you want to test deeper pagination
];

function countBy<T extends string>(
  items: Job[],
  key: 'location' | 'department',
): Record<T, number> {
  return items.reduce(
    (acc, job) => {
      const k = job[key] as unknown as T;
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function NoJobsAvailable() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
      {/* Custom icon from /public/icons */}
      <Image
        src="/icons/file-search.png"
        alt="No jobs available"
        width={64}
        height={64}
        className="mb-6 opacity-70"
      />

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800">Currently No Open Positions</h2>

      {/* Subtitle */}
      <p className="mt-2 text-sm text-gray-500 max-w-md">
        We&apos;ll update this page as soon as new vacancies become available
      </p>
    </div>
  );
}

export default function VacanciesBoard({
  jobs,
  initialPageSize = 9,
  dir = 'ltr',
  className,
}: Props) {
  const data = jobs?.length ? jobs : STATIC_JOBS;

  const allLocationCounts = useMemo(() => countBy<string>(data, 'location'), [data]);
  const allDepartmentCounts = useMemo(() => countBy<string>(data, 'department'), [data]);

  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo(() => {
    const byLocation = selectedLocations.size
      ? data.filter((j) => selectedLocations.has(j.location))
      : data;
    const byDept = selectedDepartments.size
      ? byLocation.filter((j) => selectedDepartments.has(j.department))
      : byLocation;

    return byDept;
  }, [data, selectedLocations, selectedDepartments]);

  const visibleLocationCounts = useMemo(() => countBy<string>(filtered, 'location'), [filtered]);
  const visibleDepartmentCounts = useMemo(
    () => countBy<string>(filtered, 'department'),
    [filtered],
  );

  React.useEffect(() => {
    setPage(1);
  }, [selectedLocations, selectedDepartments, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = paginate(filtered, page, pageSize);
  const showPagination = pageItems.length > 0 && totalPages > 1;

  const toggleLocation = (loc: string) =>
    setSelectedLocations((prev) => {
      const next = new Set(prev);
      next.has(loc) ? next.delete(loc) : next.add(loc);
      return next;
    });

  const toggleDepartment = (dep: string) =>
    setSelectedDepartments((prev) => {
      const next = new Set(prev);
      next.has(dep) ? next.delete(dep) : next.add(dep);
      return next;
    });

  const clearAll = () => {
    setSelectedLocations(new Set());
    setSelectedDepartments(new Set());
  };

  if (!data.length) {
    return (
      <section dir={dir} className={clsx('w-full', className)}>
        <div className="min-h-[60vh] grid place-items-center">
          <NoJobsAvailable />
        </div>
      </section>
    );
  }

  return (
    <section dir={dir} className="w-full py-16 px-20">
      <div className="grid grid-cols-[16rem_minmax(0,1fr)] gap-8">
        {/* Sidebar Filters */}
        <aside className="max-w-xs min-w-0 space-y-6">
          {/* Filter by Location */}
          <FilterSection
            title="Filter by Location"
            onClear={() => setSelectedLocations(new Set())}
            hasActive={selectedLocations.size > 0}
          >
            <ul className="max-h-80 overflow-auto pr-1 space-y-2">
              {Object.entries(allLocationCounts).map(([loc, total]) => {
                const active = selectedLocations.has(loc);
                const visibleCount = visibleLocationCounts[loc] ?? 0;
                const disabled = !active && visibleCount === 0 && selectedLocations.size > 0;
                return (
                  <li key={loc} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={active}
                      disabled={disabled}
                      onChange={() => toggleLocation(loc)}
                    />
                    <span className={clsx('text-sm', disabled && 'opacity-40')}>{loc}</span>
                    <span className="ml-auto text-xs tabular-nums text-gray-500">{total}</span>
                  </li>
                );
              })}
            </ul>
          </FilterSection>

          {/* Filter by Department */}
          <FilterSection
            title="Filter by Department"
            onClear={() => setSelectedDepartments(new Set())}
            hasActive={selectedDepartments.size > 0}
          >
            <ul className="max-h-80 overflow-auto pr-1 space-y-2">
              {Object.entries(allDepartmentCounts).map(([dep, total]) => {
                const active = selectedDepartments.has(dep);
                const visibleCount = visibleDepartmentCounts[dep] ?? 0;
                const disabled = !active && visibleCount === 0 && selectedDepartments.size > 0;
                return (
                  <li key={dep} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={active}
                      disabled={disabled}
                      onChange={() => toggleDepartment(dep)}
                    />
                    <span className={clsx('text-sm', disabled && 'opacity-40')}>{dep}</span>
                    <span className="ml-auto text-xs tabular-nums text-gray-500">{total}</span>
                  </li>
                );
              })}
            </ul>
          </FilterSection>

          {/* Active chips + reset */}
          {(selectedLocations.size > 0 || selectedDepartments.size > 0) && (
            <div className="flex flex-wrap gap-2">
              {[...selectedLocations].map((x) => (
                <Chip key={`loc-${x}`} label={x} onRemove={() => toggleLocation(x)} />
              ))}
              {[...selectedDepartments].map((x) => (
                <Chip key={`dep-${x}`} label={x} onRemove={() => toggleDepartment(x)} />
              ))}
              <button onClick={clearAll} className="text-xs underline text-gray-600">
                Clear all
              </button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="flex flex-wrap items-center space-y-4 min-w-0 max-w-4xl">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-28px text-primary font-semibold">Available vacancies</h2>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-3 gap-4">
            {pageItems.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="flex flex-wrap items-center justify-between bg-[#FFFFFF] rounded-2xl w-full py-2 px-6">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  Display
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="border rounded-md px-2 py-1"
                  >
                    {[9, 12, 15, 25].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="text-sm text-gray-600">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div>
                <nav className="flex items-between gap-1">
                  <button
                    className="px-3 py-1 border rounded-md disabled:opacity-40"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    aria-label="First page"
                  >
                    «
                  </button>
                  <button
                    className="px-3 py-1 border rounded-md disabled:opacity-40"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  {/* numbered buttons (show window) */}
                  {Array.from({ length: totalPages })
                    .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                    .map((_, idx, arr) => {
                      const start = Math.max(1, page - 2);
                      const num = start + idx;
                      if (num > totalPages) return null;
                      const isActive = num === page;
                      return (
                        <button
                          key={num}
                          onClick={() => setPage(num)}
                          className={clsx(
                            'px-3 py-1 border rounded-full',
                            isActive && 'bg-indigo-600 text-white border-indigo-600',
                          )}
                        >
                          {num}
                        </button>
                      );
                    })}

                  <button
                    className="px-3 py-1 border rounded-md disabled:opacity-40"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                  <button
                    className="px-3 py-1 border rounded-md disabled:opacity-40"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    aria-label="Last page"
                  >
                    »
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterSection({
  title,
  children,
  onClear,
  hasActive,
}: {
  title: string;
  children: React.ReactNode;
  onClear?: () => void;
  hasActive?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {hasActive ? (
          <button className="text-xs underline text-gray-600" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </span>
  );
}

