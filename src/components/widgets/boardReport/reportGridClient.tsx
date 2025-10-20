'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSf } from '../../../utils/hooks/useSf';

type PdfFile = {
  Id: string;
  Title: string;
  Url: string;
  Extension?: string;
  MimeType?: string;
};

type ReportFile = {
  Id: string;
  Title: string;
  ItemDefaultUrl?: string;
  FileName?: string;
  Year?: number;
  PDF?: PdfFile[];
};

type BoardReportResponse = {
  Id: string;
  Title: string;
  Description?: string;
  Files?: ReportFile[];
};

export default function ReportGridClient({
  lang,
  id,
  title,
  description,
  years,
  allowPagination,
}: {
  lang?: string;
  id: string;
  title?: string;
  description?: string;
  years?: string[];
  allowPagination?: boolean;
}) {
  const [activeYear, setActiveYear] = useState<string | undefined>(
    years && years.length ? years[0] : undefined,
  );

  const { data, error, isLoading } = useSf<BoardReportResponse>(
    `api/default/boardreports/${id}`,
    {
      $top: '100',
      $expand:
        "Files($select=Id,Title,ItemDefaultUrl,FileName,Year;$expand=PDF($select=Id,Title,Url,Extension,MimeType))",
      ...(lang === 'ar' ? { sf_culture: 'ar' } : {}),
    },
    {
      revalidateOnFocus: false,
    },
  );

  const files = data?.Files ?? [];

  const grouped = useMemo(() => {
    const map = new Map<string, ReportFile[]>();
    for (const f of files) {
      const y = String(f.Year ?? '');
      if (!y) continue;
      if (!map.has(y)) map.set(y, []);
      map.get(y)!.push(f);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => a.Title.localeCompare(b.Title));
    }
    return map;
  }, [files]);

  const list = activeYear ? grouped.get(activeYear) ?? [] : [];

  return (
    <div className="w-full md:mt-16">
      {(title || description) && (
        <header className="mb-6">
          {title && (
            <h2 className="md:text-5xl xs:text-2xl font-bold text-primary">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-default">{description}</p>
          )}
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
                  'px-5 py-2 rounded-full text-base transition',
                  isActive
                    ? 'bg-primaryAlt text-whiteCta'
                    : 'bg-transparent text-slate-500 cursor-pointer',
                ].join(' ')}
                aria-pressed={isActive}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}

      {isLoading && (
        <p className="text-center text-default">Loading reports…</p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          Failed to load reports.
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((file) => {
            const pdf = file.PDF?.[0];
            const href = pdf?.Url
              ? pdf.Url
              : file.ItemDefaultUrl
              ? file.ItemDefaultUrl
              : file.FileName
              ? `/docs/default-source/default-document-library/${file.FileName}.pdf`
              : undefined;

            return (
              <article
                key={file.Id}
                className="rounded-2xl border border-slate-200 dark:border-none bg-white dark:bg-[#131321] 
                shadow-sm px-6 pb-6 pt-10 flex flex-col items-center justify-center"
              >
                <div className="mb-6 grid place-items-center w-16 h-16 rounded-2xl bg-[#f5f6ff] dark:bg-[#a6efd9]">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${file.Title} (PDF)`}
                    >
                      <span className="pdf-icon text-[#212121] dark:text-[#010663]" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="pdf-icon opacity-40" aria-hidden="true" />
                  )}
                </div>
                <h3 className="text-center text-[16px] font-semibold text-[#212121] dark:text-[#fafafa]">
                  {file.Title}
                </h3>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
