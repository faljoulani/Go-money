'use client';
import React, { useMemo, useState } from 'react';
import { useSf } from '../../../utils/hooks/useSf';

type ReportedFile = {
  Id: string;
  Title: string;
  UrlName?: string;
};

type ODataList<T> = {
  value: T[];
  '@odata.count'?: number;
};

export default function ReportGridClient({
  files, 
  pageSize,
  initialOffset,
  allowPagination,
  title,
  years,
  description,
}: {
  files: Array<{ Id: string; Title: string; UrlName?: string }>; 
  pageSize: number;
  initialOffset: number;
  allowPagination: boolean;
  title?: string;
  years?: string[];
  description?: string;
}) {
  const [activeYear, setActiveYear] = useState<string | undefined>(
    years && years.length ? years[0] : undefined,
  );

  const [offset, setOffset] = useState<number>(Math.max(0, initialOffset || 0));
  const size = Math.max(0, pageSize || 0);

  const params = useMemo(() => {
    if (!activeYear) return null;
    return {
      $filter: `Year eq ${activeYear}`,
      $orderby: 'Title asc',
      $count: 'true',

    };
  }, [activeYear]);

  const { data, error, isLoading } = useSf<ODataList<ReportedFile>>(
     'api/default/reportedfiles',
    params || undefined,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, 
    },
  );

  const items = data?.value ?? [];

  const total = items.length;
  const hasPaging = allowPagination && size > 0;
  const pageItems = hasPaging ? items.slice(offset, offset + size) : items;

  const canPrev = hasPaging && offset > 0;
  const canNext = hasPaging && offset + size < total;

  return (
    <div className="w-full">
      {(title || description) && (
        <header className="mb-6">
          {title && <h2 className="text-5xl font-bold text-primary">{title}</h2>}
          {description && <p className="mt-4 text-slate-600">{description}</p>}
        </header>
      )}

      {years && years.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4">
          {years.map((year) => {
            const isActive = year === activeYear;
            return (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setActiveYear(year);
                  setOffset(0);
                }}
                className={[
                  'px-5 py-2 rounded-full text-base md:text-lg transition',
                  isActive
                    ? 'bg-[#0B1C5A] text-white'
                    : 'bg-transparent text-slate-500 hover:text-slate-800 cursor-pointer',
                ].join(' ')}
                aria-pressed={isActive}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
      
      {/* add atom later for loading */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-8 animate-pulse"
            >
              <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-slate-100" />
              <div className="mx-auto h-4 w-3/4 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          Failed to load reports for {activeYear}.
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pageItems.map((f) => (
              <article
                key={f.Id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-8 flex flex-col items-center justify-center"
              >
                <div className="mb-5 grid place-items-center w-16 h-16 rounded-2xl bg-slate-100">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="#0B1C5A"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <h3 className="text-center text-[17px] font-semibold text-slate-900">{f.Title}</h3>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

