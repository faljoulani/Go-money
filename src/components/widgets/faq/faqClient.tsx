'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSf } from '../../../utils/hooks/useSf';
import Description from '../../atoms/description/description';

type Category = { Id: string; Title: string };
type Question = { Id: string; Title: string; Answer?: string; Order?: number; ParentId?: string };
type SfList<T> = { value: T[] };

export default function QuestionsClient({
  categories,
  lang,
}: {
  categories: Category[];
  lang?: string;
}) {
  const defaultActive = categories[0]?.Id ?? '';
  const [active, setActive] = useState<string>(defaultActive);

  const { data, error, isLoading } = useSf<SfList<Question>>(
    'api/default/faqquestions',
    {
      $select: 'Id,Title,Answer,Order,ParentId,ItemDefaultUrl',
      $orderby: 'Order asc, Title asc',
      ...(lang === 'ar' ? { sf_culture: 'ar' } : {}),
    },
    { revalidateOnFocus: true },
  );

  const questions = useMemo(() => {
    const all = data?.value ?? [];
    const a = active.toLowerCase();
    const filtered = all.filter((q) => (q.ParentId || '').toLowerCase() === a);
    filtered.sort((x, y) => (x.Order ?? 0) - (y.Order ?? 0) || x.Title.localeCompare(y.Title));
    return filtered;
  }, [data, active]);

  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    setOpenId(questions[0]?.Id ?? null);
  }, [active, questions]);

  return (
    <section
      className="
        md:mx-20 overflow-clip
         xs:flex-col xs:gap-2 xs:pt-[30px]
        md:flex md:flex-row md:gap-8 md:pt-[58px] md:pb-16
      "
    >
      {/* LEFT: desktop categories */}
      <aside className="w-[360px] xs:hidden md:block fadeLeft">
        <ul
          className="
            overflow-hidden rounded-2xl
            border border-line dark:border-white/10
            bg-surface-section
          "
        >
          {categories.map((cat) => {
            const isActive = active === cat.Id;
            return (
              <li
                key={cat.Id}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setActive(cat.Id)}
                className={[
                  'flex cursor-pointer items-center justify-between px-6 py-5 text-[15px]',
                  'border-t border-line first:border-t-0 dark:border-white/10',
                  isActive
                    ? 'bg-primaryAlt text-secondary'
                    : 'bg-surface-section text-default hover:opacity-90',
                ].join(' ')}
              >
                <span className={isActive ? 'font-medium' : 'font-normal'}>{cat.Title}</span>
                <span
                  className={[
                    'grid h-8 w-8 place-items-center rounded-lg rtl:rotate-180',
                    isActive ? 'text-secondary' : 'text-default',
                  ].join(' ')}
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="hidden h-[24px] w-[24px] md:block"
                  >
                    <line x1="0" y1="12" x2="15" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* TOP: mobile categories (chips) */}
      <div className="md:hidden xs:block">
        <ul
          className="
            flex snap-x snap-mandatory items-center gap-3 overflow-x-auto md:rounded-2xl md:border
            border-line md:dark:border-white/10 md:bg-surface-section md:px-8 py-4 pb-4
            [scrollbar-width:none] [-ms-overflow-style:none] h-[3.4rem]
          "
        >
          <style>{`ul::-webkit-scrollbar{display:none}`}</style>
          {categories.map((cat) => {
            const isActive = active === cat.Id;
            return (
              <li key={cat.Id} className="snap-start shrink-0">
                <button
                  onClick={() => setActive(cat.Id)}
                  className={[
                    'rounded-xl px-5 py-2.5 text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primaryAlt text-secondary shadow-sm'
                      : 'bg-surface-section text-default border border-line dark:border-white/10',
                  ].join(' ')}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {cat.Title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT: questions */}
      <div className="flex-1 fadeRight">
        <div className="rounded-xl">
          {isLoading && <div className="p-6 text-default/70">Loading…</div>}
          {error && <div className="p-6 text-rose-500">Failed to load FAQs</div>}
          {!isLoading && !error && questions.length === 0 && (
            <div className="p-6 text-default/70">No questions in this category yet.</div>
          )}

          {questions.map((q) => {
            const isOpen = openId === q.Id;
            return (
              <details
                key={q.Id}
                className="
                  group mb-4 rounded-xl border bg-surface-section
                  border-line dark:border-white/10
                  p-6
                "
                open={isOpen}
              >
                <summary
                  className="flex cursor-pointer list-none items-center justify-between"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenId((prev) => (prev === q.Id ? null : q.Id));
                  }}
                >
                  <span className="font-semibold text-default">{q.Title}</span>
                  <span
                    className="
                      ml-6 grid size-9 place-items-center rounded-lg
                      bg-primaryAlt text-secondary
                    "
                  >
                    <svg
                      viewBox="0 0 14 14"
                      className="h-[15px] w-[15px]"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {isOpen ? (
                        <line x1="0" y1="7" x2="15" y2="7" />
                      ) : (
                        <>
                          <line x1="7" y1="0" x2="7" y2="15" />
                          <line x1="0" y1="7" x2="15" y2="7" />
                        </>
                      )}
                    </svg>
                  </span>
                </summary>

                {q.Answer && (
                  <Description className="mt-6 text-14px leading-5 text-default" html={q.Answer} />
                )}
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

