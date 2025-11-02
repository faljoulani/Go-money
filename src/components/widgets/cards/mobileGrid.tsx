'use client';
import React, { useEffect, useRef, useState } from 'react';
import Description from '../../atoms/description/description';

export function MobileGridCarousel({
  items,
  dir,
  target,
}: {
  items: {
    id: string;
    title: string;
    description?: string;
    imgUrl?: string;
    href?: string;
    icon?: any;
  }[];
  dir: string;
  target?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;

    const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(Number((vis.target as HTMLElement).dataset.index));
      },
      { root, threshold: [0.5] },
    );

    slides.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const root = trackRef.current;
    const el = root?.querySelector<HTMLElement>(`[data-slide="${i}"]`);
    if (root && el) root.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden xs:block mt-10">
      <div
        ref={trackRef}
        className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth
                   [-ms-overflow-style:none] [scrollbar-width:none] ${target === 'scrollableCards' ? '' : '-mx-4'}`}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

        {items.map((card, i) => {
          const isOdd = i % 2 === 1; // <-- use index parity
          return (
            <article
              key={card.id ?? i}
              data-slide={i}
              data-index={i}
              className={`
                ${i === 0 ? 'ltr:ml-4 rtl:mr-4' : ''}
                ${i === items.length - 1 ? 'ltr:mr-4 rtl:ml-4' : ''}
                relative snap-center shrink-0 w-[85%] max-w-[360px] rounded-xl bg-surface-section p-8`}
            >
              {card.imgUrl && (
                <div className="relative overflow-hidden rounded-xl w-full h-[250px]">

              {target === 'scrollableCards' && (
                <div className={`absolute   ${isOdd ? 'left-0 -bottom-0' : 'right-0 -bottom-0'}`}>
                  <div
                    className={`relative w-[72px]  h-[72px] border-none  ${
                      isOdd ? 'bg-[#0DF9C4] border rounded-tr-3xl ' : 'bg-[#1919E5] rounded-tl-3xl'
                    }`}
                  >
                    <div
                      className={`absolute w-10 h-10  bg-white   dark:bg-[#1D1D28] ${
                        isOdd ? 'left-0 -bottom-0 rounded-bl-xl' : 'right-0 -bottom-0'
                      }`}
                    />
                  </div>
                </div>
              )}
                  <img
                    src={card.imgUrl}
                    alt={card.title || 'card image'}
                    className="w-full h-full object-cover border-none"
                    loading="lazy"
                  />
                </div>
              )}


              {card.icon && (
                <div>{card.icon}</div>
              )}

              <div>
                <h3 className="text-[20px] leading-7 font-medium text-primaryAlt">{card.title}</h3>
                {card.description && (
                  <div className="mt-2 text-sm leading-5">
                    <Description html={card.description} />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
              active === i ? 'w-12 bg-primary' : 'w-2 bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
