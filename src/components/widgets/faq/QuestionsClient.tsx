'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Category = { Id: string; Title: string };
type Question = { Id: string; Title: string; Answer?: string; Order?: number; ParentId?: string };

export default function QuestionsClient({
  categories,
  grouped,
}: {
  categories: Category[];
  grouped: Record<string, Question[]>;
}) {
  const defaultActive = categories[0]?.Id ?? '';
  const [active, setActive] = useState<string>(defaultActive);

  const questions = useMemo(
    () => grouped[(active || '').toLowerCase()] ?? [],
    [active, grouped],
  );

  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setOpenId(questions[0]?.Id ?? null);
  }, [active, questions]);

  return (
    <div className="flex gap-8 px-20 pt-[58px] pb-16">
      <aside className="w-[25%]">
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
                  className={`grid place-items-center w-8 h-8 rounded-lg ${
                    isActive ? 'text-white' : 'text-[#0b1C5A]'
                  }`}
                  aria-hidden
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </span>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Questions */}
      <div className="w-[75%]">
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white/70">
          {questions.length === 0 && (
            <div className="p-6 text-slate-500">No questions in this category yet.</div>
          )}

          {questions.map((q) => {
            const isOpen = openId === q.Id;
            return (
              <details key={q.Id} className="group p-6" open={isOpen}>
                <summary
                  className="flex list-none items-center justify-between cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault(); 
                    setOpenId((prev) => (prev === q.Id ? null : q.Id));
                  }}
                >
                  <span className="text-slate-900">{q.Title}</span>
                  <span className="ml-6 grid size-8 place-items-center rounded-lg bg-[#0B1C5A] text-white">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`w-4 h-4 transition ${isOpen ? 'rotate-45' : ''}`}
                    >
                      <path d="M10 4v12M4 10h12" />
                    </svg>
                  </span>
                </summary>
                {q.Answer && <div className="mt-3 text-slate-600 leading-6">{q.Answer}</div>}
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
