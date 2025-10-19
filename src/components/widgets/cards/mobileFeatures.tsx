'use client';
import React, { useEffect, useRef, useState } from 'react';
import Description from '../../atoms/description/description';

export function MobileFeaturesCarousel({
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
    <div className="md:hidden xs:block  h-[275px]">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ WebkitOverflowScrolling: 'touch' }}
        role="region"
        aria-label="Features carousel"
      >
        {items.map((card, i) => (
          <article
            key={card.id ?? i}
            data-slide={i}
            data-index={i}
            className={`snap-center shrink-0 w-[250px] rounded-[32px] h-auto bg-white/10 py-10 flex flex-col items-center ${i === 0 ? 'ml-4' : ''} ${i === items.length - 1 ? 'mr-4' : ''}`}>
            {card.imgUrl && (
              <div className="relative overflow-hidden ">
                <img
                  src={card.imgUrl}
                  alt={card.title || 'card image'}
                  className="w-14 h-14 object-cover"
                  loading="lazy"
                />
              </div>
            )}
            {card.icon && <div className="ml-12 mt-12">{card.icon}</div>}
            <div className="pt-4 pb-6 px-3">
              <h3 className="text-2xl leading-8 text-white text-center">{card.title}</h3>
              {card.description && (
                <div className="mt-2 text-base leading-5 text-center">
                  <Description html={card.description} color="text-[#E0E0E0]" />
                </div>
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
            className={`h-1.5 rounded-full  transition-[width,background-color] duration-300 ${
              active === i ? 'w-12 bg-white' : 'w-2 bg-[#FFFFFF80]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

