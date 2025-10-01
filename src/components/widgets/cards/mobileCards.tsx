'use client';
import React, { useEffect, useRef, useState } from 'react';

export function MobileCardsCarousel({
  items,
}: {
  items: {
    id: string;
    title: string;
    description?: string;
    imgUrl?: string;
    href?: string;
    icon?: any;
  }[];
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
    if (root && el) root.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' }); // 16 = gap padding
  };

  return (
    <div className="md:hidden xs:block mt-10 px-4">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth
                   [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

        {items.map((card, i) => (
          <article
            key={card.id ?? i}
            data-slide={i}
            data-index={i}
            className="snap-start shrink-0 w-[85%] max-w-[360px] rounded-xl bg-white"
          >
            {card.imgUrl && (
              <div className="relative overflow-hidden rounded-xl w-full h-[250px]">
                <img
                  src={card.imgUrl}
                  alt={card.title || 'card image'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            {card.icon && <div className="ml-12 mt-12">{card.icon}</div>}
            <div className="pt-4 pb-6 px-3">
              <h3 className="text-[20px] leading-7 font-medium text-primary">{card.title}</h3>
              {card.description && (
                <p
                  className="mt-2 text-default text-sm leading-5"
                  dangerouslySetInnerHTML={{ __html: card.description }}
                />
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
              active === i ? 'w-6 bg-primary' : 'w-2 bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
