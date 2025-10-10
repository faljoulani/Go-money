'use client';

import Image from 'next/image';

export default function Pagination({
  page,
  totalPages,
  totalResults,
  pageSize,
  onPage,
  onPageSize,
}: {
  page: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (n: number) => void;
}) {
  const atStart = page <= 1;
  const atEnd = page >= Math.max(1, totalPages);

  const start = Math.max(1, page - 2);

  const pagesNumbers = Array.from({ length: 5 }, (_, i) => start + i).filter(
    (n) => n <= totalPages,
  );

  return (
    <div
      dir="ltr"
      className="w-full rounded-2xl shadow-md bg-white dark:bg-[#000000] py-3 px-4 sm:py-2 sm:px-6"
    >
      {/* MOBILE nav */}
      <nav
        aria-label="Pagination"
        className="sm:hidden flex items-center justify-center gap-6 py-1"
      >
        {/* Prev */}
        <button
          onClick={() => !atStart && onPage(page - 1)}
          disabled={atStart}
          className="inline-flex items-center gap-2 disabled:opacity-40"
        >
          <span
            className={[
              'h-4 w-4',
              atStart ? 'bg-gray-300' : 'bg-gray-500',
              "[mask-image:url('/icons/arrow-single-left.png')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]",
            ].join(' ')}
            aria-hidden
          />
          <span className={atStart ? 'text-gray-300' : 'text-gray-500'}>Prev</span>
        </button>

        <ul className="flex items-center gap-6">
          {pagesNumbers.map((n) => {
            const isActive = n === page;
            return (
              <li key={n}>
                <button
                  onClick={() => onPage(n)}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'relative inline-flex items-center justify-center text-base leading-none',

                    'after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-[2px] after:w-5 after:rounded-full',

                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primaryAlt',
                    'dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#000]',

                    isActive
                      ? [
                          'text-[#001a72] after:bg-[#001a72]',
                          'dark:text-white dark:after:bg-white',
                        ].join(' ')
                      : [
                          'text-gray-700 hover:text-gray-900',
                          'dark:text-gray-300 dark:hover:text-gray-100',
                          'after:bg-transparent dark:after:bg-transparent',
                        ].join(' '),
                  ].join(' ')}
                >
                  {n}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Next */}
        <button
          onClick={() => !atEnd && onPage(page + 1)}
          disabled={atEnd}
          className="inline-flex items-center gap-2 disabled:opacity-40"
        >
          <span className={atEnd ? 'text-gray-300' : 'text-primaryAlt'}>Next</span>
          <span
            className={[
              'h-4 w-4',
              atEnd ? 'bg-gray-300' : 'bg-primaryAlt',
              "[mask-image:url('/icons/arrow-single-right.png')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]",
            ].join(' ')}
            aria-hidden
          />
        </button>
      </nav>

      {/* === Desktop (sm+) — your existing layout === */}
      <div className="hidden sm:flex w-full items-center justify-between">
        <div className="flex items-center gap-3 ">
          <label className="flex items-center gap-2 text-sm">
            Display
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="rounded-md border px-2 py-1 bg-white dark:bg-[#000000]"
            >
              {[9, 12, 15, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span className="text-sm text-default">
            {totalResults} result{totalResults !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="text-sm text-default">
          Page {page} of {Math.max(1, totalPages)}
        </div>

        <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
          {/* Left pill: double + single */}
          <button
            onClick={() => !atStart && onPage(1)}
            disabled={atStart}
            className="flex items-center gap-1 rounded-full border px-3 py-2 disabled:opacity-40"
            aria-label="First"
          >
            <Image src="/icons/arrow-double-left.png" alt="" width={16} height={16} aria-hidden />
            <Image src="/icons/arrow-single-left.png" alt="" width={16} height={16} aria-hidden />
          </button>

          {pagesNumbers.map((n) => (
            <button
              key={n}
              onClick={() => onPage(n)}
              aria-current={n === page ? 'page' : undefined}
              className={`grid h-10 w-10 place-items-center rounded-full border text-base ${
                n === page
                  ? 'border-primary bg-primaryAlt text-white dark:text-[#000]'
                  : 'border-gray-300 text-default'
              }`}
            >
              {n}
            </button>
          ))}

          {/* Right pill: single + double */}
          <button
            onClick={() => !atEnd && onPage(totalPages)}
            disabled={atEnd}
            className="flex items-center gap-1 rounded-full border px-3 py-2 disabled:opacity-40"
            aria-label="Last"
          >
            <span className="h-4 w-4 bg-primaryAlt [mask-image:url('/icons/arrow-single-right.png')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]"></span>
            <span className="h-4 w-4 bg-primaryAlt [mask-image:url('/icons/arrow-double-right.png')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]"></span>
          </button>
        </nav>
      </div>
    </div>
  );
}

