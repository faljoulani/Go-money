'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import SimpleHeroHeading from './simpleHeroHeading.client';
import { CAREERS_ACTIVE_JOB_EVENT, type CareersActiveJobDetail } from '../../../utils/careersEvents';
import './simpleHeroActiveTitle.css';

type Mode = 'list' | 'details' | 'apply';

type Props = {
  lang: 'en' | 'ar';
  defaultTitle: string;
};

export default function SimpleHeroActiveTitle({ lang, defaultTitle }: Props) {
  const [mode, setMode] = useState<Mode>('list');
  const [currentTitle, setCurrentTitle] = useState(defaultTitle);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentTitle(defaultTitle);
    setMode('list');
  }, [defaultTitle]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<CareersActiveJobDetail>).detail;
      if (!detail) return;
      if (detail.lang && detail.lang !== lang) return;

      const nextMode = (detail.mode as Mode | undefined) ?? 'list';
      setMode(nextMode);

      if (detail.title && detail.title.trim()) {
        setCurrentTitle(detail.title.trim());
      } else if (nextMode === 'apply') {
        setCurrentTitle(lang === 'ar' ? 'التقدم لهذه الوظيفة' : 'Apply for this job');
      } else if (nextMode === 'list') {
        setCurrentTitle(defaultTitle);
      }
    };

    window.addEventListener(CAREERS_ACTIVE_JOB_EVENT, handler as EventListener);
    return () => window.removeEventListener(CAREERS_ACTIVE_JOB_EVENT, handler as EventListener);
  }, [defaultTitle, lang]);

  const headingClass = useMemo(
    () =>
      'md:text-[40px] font-bold mb-3 text-white tracking-tight md:leading-[52px] xs:text-2xl xs:leading-8 w-auto text-center',
    [],
  );

  useEffect(() => {
    const overlayEl = hostRef.current;
    const container = overlayEl?.parentElement;
    if (!overlayEl || !container) return;

    const siblings = Array.from(container.children).filter(
      (el): el is HTMLElement => el !== overlayEl && el instanceof HTMLElement,
    );

    const hideTargets = siblings.filter(
      (el) => !el.querySelector('[data-sfcontainer="Breadcrumb"]'),
    );

    if (mode === 'list') {
      hideTargets.forEach((el) => {
        if (!el.hasAttribute('data-simple-hero-hidden')) return;
        el.style.opacity = el.getAttribute('data-simple-hero-hidden-opacity') || '';
        el.style.pointerEvents = el.getAttribute('data-simple-hero-hidden-pointer') || '';
        el.removeAttribute('data-simple-hero-hidden');
        el.removeAttribute('data-simple-hero-hidden-opacity');
        el.removeAttribute('data-simple-hero-hidden-pointer');
      });
      return;
    }

    hideTargets.forEach((el) => {
      if (!el.hasAttribute('data-simple-hero-hidden')) {
        el.setAttribute('data-simple-hero-hidden', 'true');
        el.setAttribute('data-simple-hero-hidden-opacity', el.style.opacity || '');
        el.setAttribute('data-simple-hero-hidden-pointer', el.style.pointerEvents || '');
      }
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    });

    return () => {
      hideTargets.forEach((el) => {
        if (!el.hasAttribute('data-simple-hero-hidden')) return;
        el.style.opacity = el.getAttribute('data-simple-hero-hidden-opacity') || '';
        el.style.pointerEvents = el.getAttribute('data-simple-hero-hidden-pointer') || '';
        el.removeAttribute('data-simple-hero-hidden');
        el.removeAttribute('data-simple-hero-hidden-opacity');
        el.removeAttribute('data-simple-hero-hidden-pointer');
      });
    };
  }, [mode]);

  if (mode === 'list') return null;

  return (
    <div ref={hostRef} className="simple-hero-overlay-root">
      <div className="simple-hero-overlay-content">
        <SimpleHeroHeading defaultTitle={currentTitle} lang={lang} className={headingClass} />
      </div>
    </div>
  );
}
