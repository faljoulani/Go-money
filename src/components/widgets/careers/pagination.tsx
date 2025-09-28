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
  const start = Math.max(1, page - 2);
  const windowNums = Array.from({ length: 5 }, (_, i) => start + i).filter((n) => n <= totalPages);

  const atStart = page <= 1;
  const atEnd = page >= Math.max(1, totalPages);

  return (
    <div className="flex w-full items-center justify-between rounded-2xl bg-white py-2 px-6">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          Display
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
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
        Page {page} of {Math.max(1, totalPages)}
      </div>

      <nav className="flex items-center justify-between">
        {/* Left pill: double + single */}
        <button
          onClick={() => !atStart && onPage(1)}
          disabled={atStart}
          className="flex items-center gap-1 rounded-full border px-3 py-2 disabled:opacity-40"
          aria-label="First"
        >
          <Image src="/icons/arrow-double-left.png" alt="First page" width={16} height={16} />
          <Image src="/icons/arrow-single-left.png" alt="Previous page" width={16} height={16} />
        </button>

        {windowNums.map((n) => (
          <button
            key={n}
            onClick={() => onPage(n)}
            className={`grid h-10 w-10 place-items-center rounded-full border text-base ${
              n === page ? 'border-primary bg-primary text-white' : 'border-gray-300 text-gray-700'
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
          <Image src="/icons/arrow-single-right.png" alt="Next page" width={16} height={16} />
          <Image src="/icons/arrow-double-right.png" alt="Last page" width={16} height={16} />
        </button>
      </nav>
    </div>
  );
}

