// src/components/.../wakeup.tsx
'use client';

import React from 'react';

type WakeUpProps = {
  children: React.ReactNode;
  /** 0..1 viewport fraction to trigger; default 0.2 */
  threshold?: number;
  /** play only once; default true */
  once?: boolean;
  /** flip axis */
  axis?: 'x' | 'y';
  /** extra classes for the OUTER shell (the perspective container) */
  className?: string;
  /** optional delay in ms */
  delayMs?: number;
};

export default function WakeUp({
  children,
  threshold = 0.2,
  once = true,
  axis = 'x',
  className = '',
  delayMs = 0,
}: WakeUpProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            const t = setTimeout(() => setInView(true), delayMs);
            return () => clearTimeout(t);
          }
          setInView(true);
          if (once) io.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once, delayMs]);

  // We keep perspective on the outer shell and animate the inner.
  return (
    <div
      ref={ref}
      className={`
        ${className}
        transform-gpu
        [perspective:1200px]
      `}
    >
      <div
        className={`
          preserve-3d backface-hidden transform-gpu
          ${inView ? (axis === 'x' ? 'animate-flip-in-x' : 'animate-flip-in-y') : ''}
          motion-reduce:transition-none motion-reduce:animate-none
        `}
        // ensure it starts "on its back" before IntersectionObserver fires:
        style={{
          transform: inView ? undefined : axis === 'x' ? 'rotateX(90deg)' : 'rotateY(90deg)',
          opacity: inView ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}