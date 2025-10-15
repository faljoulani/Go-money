'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import { CAREERS_ACTIVE_JOB_EVENT, type CareersActiveJobDetail } from '../../../utils/careersEvents';

type Mode = 'list' | 'details' | 'apply';

type Props = {
  lang: 'en' | 'ar';
  defaultTitle: string;
  subtitleHtml?: string;
  descriptionHtml?: string;
  breadcrumbs?: ReactNode;
  titleClassName: string;
  subtitleClassName?: string;
  descriptionClassName?: string;
};

export default function SimpleHeroDynamic({
  lang,
  defaultTitle,
  subtitleHtml,
  descriptionHtml,
  breadcrumbs,
  titleClassName,
  subtitleClassName,
  descriptionClassName,
}: Props) {
  const [mode, setMode] = useState<Mode>('list');
  const [currentTitle, setCurrentTitle] = useState(defaultTitle);

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

  const headingClass = useMemo(() => titleClassName, [titleClassName]);
  const showExtras = mode === 'list';

  return (
    <>
      {breadcrumbs}
      <Title>
        <p className={headingClass}>{currentTitle}</p>
      </Title>
      {showExtras && subtitleHtml && subtitleClassName && (
        <Description html={subtitleHtml} className={subtitleClassName} />
      )}
      {showExtras && descriptionHtml && descriptionClassName && (
        <Description html={descriptionHtml} className={descriptionClassName} />
      )}
    </>
  );
}
