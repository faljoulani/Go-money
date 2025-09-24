'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSf } from '../../../utils/hooks/useSf';

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
  let endpoint = `api/default/faqquestions`;
 
  const { data, error, isLoading } = useSf<SfList<Question>>(
    endpoint,
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

  // One-open-at-a-time accordion
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    setOpenId(questions[0]?.Id ?? null); // first question opens on category change / first load
  }, [active, questions]);

  return (
    <section className="flex gap-8 px-20 pt-[58px] pb-16 overflow-clip">
      <aside className="w-1/4 fadeLeft">
        <ul className="rounded-2xl overflow-hidden bg-white border border-slate-200">
          {categories.map((cat) => {
            const isActive = active === cat.Id;
            return (
              <li
                key={cat.Id}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setActive(cat.Id)}
                className={`flex hover:cursor-pointer items-center justify-between px-6 py-5 text-[15px] border-t border-slate-200 first:border-t-0 ${
                  isActive ? 'bg-[#0B1C5A] text-white' : 'bg-white text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'font-medium' : 'font-normal'}>{cat.Title}</span>
                <span
                  className={`grid place-items-center w-8 h-8 rounded-lg rtl:rotate-180 ${
                    isActive ? 'text-white' : 'text-black'
                  }`}
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[24px] h-[24px]"
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

      {/* Questions */}
      <div className="flex-1 fadeRight">
        <div className=" rounded-xl">
          {isLoading && <div className="p-6 text-slate-500">Loading…</div>}
          {error && <div className="p-6 text-red-600">Failed to load FAQs</div>}
          {!isLoading && !error && questions.length === 0 && (
            <div className="p-6 text-slate-500">No questions in this category yet.</div>
          )}

          {questions.map((q) => {
            const isOpen = openId === q.Id;
            return (
              <details
                key={q.Id}
                className="group p-6 border rounded-md mb-4 bg-white border-[#E0E0E0]"
                open={isOpen}
              >
                <summary
                  className="flex list-none items-center justify-between cursor-pointer "
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenId((prev) => (prev === q.Id ? null : q.Id));
                  }}
                >
                  <span className="text-slate-900">{q.Title}</span>
                  <span className="ml-6 grid size-9 place-items-center rounded-lg bg-primary text-white">
                    <svg
                      viewBox="0 0 14 14"
                      className="w-[15px] h-[15px]"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {isOpen ? (
                        // Horizontal line (-)
                        <line x1="0" y1="7" x2="15" y2="7" />
                      ) : (
                        // Plus (+)
                        <>
                          <line x1="7" y1="0" x2="7" y2="15" />
                          <line x1="0" y1="7" x2="15" y2="7" />
                        </>
                      )}
                    </svg>
                  </span>
                </summary>
                {q.Answer && <div className="mt-6 text-slate-600 leading-6">{q.Answer}</div>}
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

