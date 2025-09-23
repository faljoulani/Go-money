// widgets/legalDocument/LegalDoc.client.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type SectionVM = {
  Id: string;
  SectionHeader: string;
  Description?: string;
  Order?: number;
  slug: string;
};

export default function LegalDocClient({
  title,
  sections,
}: {
  title: string;
  sections: SectionVM[];
}) {
  const [active, setActive] = useState<string>(sections[0]?.slug ?? '');
  const headingsRef = useRef<Record<string, HTMLElement | null>>({});

  const ids = useMemo(() => sections.map((s) => s.slug), [sections]);

  // Smooth scroll to anchor
  const scrollTo = (slug: string) => {
    const el = document.getElementById(slug);
    if (!el) return;
    // Account for any sticky headers on the site; adjust offset if you have a global navbar
    const y = el.getBoundingClientRect().top + window.scrollY - 16; // 16px breathing room
    window.history.replaceState(null, '', `#${slug}`);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // IntersectionObserver to update active TOC item
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the first heading crossing the threshold at the top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActive(visible.target.id);
        }
      },
      {
        // Trigger a bit before the true top so the highlight feels natural
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        headingsRef.current[id] = el;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [ids]);

  return (
    <section className="sf-legal-doc mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated content sections shown below.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <article className="lg:col-span-8 xl:col-span-9">
          <div className="space-y-8">
            {sections.map((s) => (
              <section
                key={s.Id}
                id={s.slug}
                className="scroll-mt-24 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6"
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-3">
                  {s.SectionHeader}
                </h2>

                {s.Description ? (
                  <div
                    className="prose prose-sm max-w-none prose-headings:scroll-mt-24"
                    dangerouslySetInnerHTML={{ __html: s.Description }}
                  />
                ) : (
                  <p className="text-gray-600 text-sm">
                    No description provided for this section.
                  </p>
                )}
              </section>
            ))}
          </div>
        </article>

        {/* Aside (sticky TOC on the right) */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                On this page
              </p>

              <nav aria-label="Table of contents" className="space-y-1">
                {sections.map((s) => {
                  const isActive = active === s.slug;
                  return (
                    <button
                      key={s.slug}
                      onClick={() => scrollTo(s.slug)}
                      className={[
                        'group w-full text-left px-3 py-2 rounded-lg transition',
                        isActive
                          ? 'bg-white shadow-sm ring-1 ring-gray-200'
                          : 'hover:bg-white/70',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'inline-flex items-center gap-2 text-sm',
                          isActive ? 'text-gray-900' : 'text-gray-600',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'h-1.5 w-1.5 rounded-full',
                            isActive ? 'bg-gray-900' : 'bg-gray-400 group-hover:bg-gray-500',
                          ].join(' ')}
                        />
                        {s.SectionHeader}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
