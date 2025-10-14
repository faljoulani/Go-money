'use client';

import { useEffect, useMemo, useState } from 'react';
import SimpleHeroHeading from './simpleHeroHeading.client';
import { CAREERS_ACTIVE_JOB_EVENT, type CareersActiveJobDetail } from '../../../utils/careersEvents';

type Mode = 'list' | 'details' | 'apply';

type Props = {
  lang: 'en' | 'ar';
  defaultTitle: string;
};

export default function HeroDynamicOverlay({ lang, defaultTitle }: Props) {
  const [mode, setMode] = useState<Mode>('list');
  const [title, setTitle] = useState(defaultTitle);

  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as CustomEvent<CareersActiveJobDetail>;
      if (detail?.lang && detail.lang !== lang) return;

      const nextMode = (detail?.mode as Mode | undefined) ?? 'list';
      setMode(nextMode);

      if (detail?.title && detail.title.trim()) {
        setTitle(detail.title.trim());
        return;
      }

      if (nextMode === 'apply') {
        setTitle(lang === 'ar' ? 'التقدم لهذه الوظيفة' : 'Apply for this job');
      } else if (nextMode === 'details') {
        setTitle(defaultTitle);
      } else {
        setTitle(defaultTitle);
      }
    };

    window.addEventListener(CAREERS_ACTIVE_JOB_EVENT, handler as EventListener);
    return () => window.removeEventListener(CAREERS_ACTIVE_JOB_EVENT, handler as EventListener);
  }, [defaultTitle, lang]);

  if (mode === 'list') return null;

  const headingClass = useMemo(
    () =>
      'text-white text-3xl md:text-[48px] leading-tight font-bold text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]',
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#02052B]/85 px-4 md:px-8">
      <div className="pointer-events-auto w-full max-w-3xl">
        <SimpleHeroHeading defaultTitle={title} lang={lang} className={headingClass} />
      </div>
    </div>
  );
}
