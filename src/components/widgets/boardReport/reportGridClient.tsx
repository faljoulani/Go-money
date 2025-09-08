'use client';
import React, { useState } from 'react';

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
  // --- pagination state (unchanged)
  const [offset, setOffset] = useState<number>(
    Math.max(0, Math.min(initialOffset || 0, Math.max(0, files.length - 1)))
  );
  const safePageSize = pageSize > 0 ? pageSize : files.length || 1;
  const totalPages = Math.max(1, Math.ceil(files.length / safePageSize));
  const currentPage = Math.floor(offset / safePageSize);
  const start = currentPage * safePageSize;
  const end = start + safePageSize;
  const pageItems = files.slice(start, end);
  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;
  const prev = () => { if (canPrev) setOffset((currentPage - 1) * safePageSize); };
  const next = () => { if (canNext) setOffset((currentPage + 1) * safePageSize); };

  const [activeYear, setActiveYear] = useState<string | undefined>(
    years && years.length ? years[0] : undefined
  );

  return (
    <div className="w-full">
      {(title || description) && (
        <header className="mb-6">
          {title && <h2 className="text-2xl md:text-3xl font-semibold text-[#0B1C5A]">{title}</h2>}
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
                onClick={() => setActiveYear(year)}
                className={[
                  'px-4 py-2 rounded-full text-base md:text-lg transition',
                  isActive
                    ? 'bg-[#0B1C5A] text-white'
                    : 'bg-transparent text-slate-500 hover:text-slate-800 cursor-pointer'
                ].join(' ')}
                aria-pressed={isActive}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pageItems.map((f) => (
          <article
            key={f.Id}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-8 flex flex-col items-center justify-center"
          >
            <div className="mb-5 grid place-items-center w-16 h-16 rounded-2xl bg-slate-100">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#0B1C5A" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <h3 className="text-center text-[17px] font-semibold text-slate-900">{f.Title}</h3>
          </article>
        ))}
      </div>

      {/* pagination UI (kept commented if you don't need it now)
      {allowPagination && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={!canPrev}
              className={['inline-flex w-10 h-10 items-center justify-center rounded-full border transition',
               canPrev ? 'bg-white border-slate-300 hover:bg-slate-50' : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'].join(' ')}>
              ←
            </button>
            <span className="text-sm tabular-nums text-slate-600">{currentPage + 1} / {totalPages}</span>
            <button onClick={next} disabled={!canNext}
              className={['inline-flex w-10 h-10 items-center justify-center rounded-full border transition',
               canNext ? 'bg-white border-slate-300 hover:bg-slate-50' : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'].join(' ')}>
              →
            </button>
          </div>
          <div />
        </div>
      )} */}
    </div>
  );
}
