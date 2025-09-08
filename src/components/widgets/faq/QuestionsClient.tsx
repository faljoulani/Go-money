'use client';
import React, { useState } from 'react';

export default function QuestionsClient({
  categories,
}: {
  categories: Array<{ Id: string; Title: string }>;
}) {
  const [active, setActive] = useState<string>(categories[0]?.Id);

  // 🔹 Static fallback questions, grouped by ParentId (category Id)
  const staticGrouped: Record<string, Array<{ Id: string; Title: string; Answer?: string }>> = {
    [categories[0]?.Id]: [
      {
        Id: '1',
        Title: 'What makes Go-money Sharia-compliant?',
        Answer:
          'All our services are structured in compliance with Islamic finance principles, reviewed by certified Sharia boards.',
      },
      {
        Id: '2',
        Title: 'Is Go-money licensed and regulated?',
        Answer: 'Yes, we are licensed and regulated by the Saudi Central Bank.',
      },
      {
        Id: '3',
        Title: 'What documents do I need to apply?',
        Answer:
          'You typically need a valid national ID, proof of income, and bank account details.',
      },
      {
        Id: '4',
        Title: 'What makes Go-money Sharia-compliant?',
        Answer:
          'All our services are structured in compliance with Islamic finance principles, reviewed by certified Sharia boards.',
      },
      {
        Id: '5',
        Title: 'Is Go-money licensed and regulated?',
        Answer: 'Yes, we are licensed and regulated by the Saudi Central Bank.',
      },
      {
        Id: '6',
        Title: 'What documents do I need to apply?',
        Answer:
          'You typically need a valid national ID, proof of income, and bank account details.',
      },
      {
        Id: '7',
        Title: 'What makes Go-money Sharia-compliant?',
        Answer:
          'All our services are structured in compliance with Islamic finance principles, reviewed by certified Sharia boards.',
      },
      {
        Id: '8',
        Title: 'Is Go-money licensed and regulated?',
        Answer: 'Yes, we are licensed and regulated by the Saudi Central Bank.',
      },
      {
        Id: '9',
        Title: 'What documents do I need to apply?',
        Answer:
          'You typically need a valid national ID, proof of income, and bank account details.',
      },
    ],
    [categories[1]?.Id]: [
      {
        Id: '10',
        Title: 'What types of financing does Go-money offer?',
        Answer:
          'We provide microfinance loans, education loans, travel loans, and emergency financing tailored to your needs.',
      },
      {
        Id: '11',
        Title: 'Are there any hidden fees?',
        Answer: 'No, our financing is fully transparent with no hidden fees.',
      },
      {
        Id: '12',
        Title: 'What happens if I miss a payment?',
        Answer:
          'If you miss a payment, you may incur late fees and your credit history could be affected.',
      },
    ],
  };

  const questions = staticGrouped[active] ?? [];

  return (
    <div className="flex gap-8 p-12">
      <aside className="w-[25%]">
        <ul className="rounded-2xl overflow-hidden bg-white border border-slate-200">
          {categories.map((cat) => {
            const isActive = active === cat.Id;
            return (
              <li
                key={cat.Id}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setActive(cat.Id)}
                className={`
                  flex hover:cursor-pointer items-center justify-between px-6 py-5 text-[15px]
                  border-t border-slate-200 first:border-t-0
                  ${isActive ? 'bg-[#0B1C5A] text-white' : 'bg-white text-slate-900 hover:bg-slate-50'}
                `}
              >
                <span className={isActive ? 'font-medium' : 'font-normal'}>{cat.Title}</span>
                <span
                  className={`grid place-items-center w-8 h-8 rounded-lg ${isActive ?   'text-white' : 'text-[#0b1C5A]'}`}
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="M7 4l6 6-6 6" />
                  </svg>
                </span>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="w-[75%]">
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white/70">
          {questions.length === 0 && (
            <div className="p-6 text-slate-500">No questions in this category yet.</div>
          )}
          {questions.map((q) => (
            <details key={q.Id} className="group p-6">
              <summary className="flex list-none items-center justify-between cursor-pointer">
                <span className="text-slate-900">{q.Title}</span>
                <span className="ml-6 grid size-8 place-items-center rounded-lg bg-[#0B1C5A] text-white">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4 group-open:rotate-45 transition"
                  >
                    <path d="M10 4v12M4 10h12" />
                  </svg>
                </span>
              </summary>
              <div className="mt-3 text-slate-600 leading-6">{q.Answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

