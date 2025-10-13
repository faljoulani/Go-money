'use client';

import { useEffect, useRef, useState } from 'react';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import { CAREERS_ACTIVE_JOB_EVENT, type CareersActiveJobDetail } from '../../../utils/careersEvents';

type Props = {
  defaultTitle: string;
  lang: 'en' | 'ar';
  className?: string;
  subtitleHtml?: string;
  subtitleClassName?: string;
  descriptionHtml?: string;
  descriptionClassName?: string;
};

type TypedEvent = CustomEvent<CareersActiveJobDetail>;

type Mode = 'list' | 'details' | 'apply';

export default function SimpleHeroHeading({
  defaultTitle,
  lang,
  className,
  subtitleHtml,
  subtitleClassName,
  descriptionHtml,
  descriptionClassName,
}: Props) {
  const defaultRef = useRef(defaultTitle);
  const [currentTitle, setCurrentTitle] = useState(defaultTitle);
  const [mode, setMode] = useState<Mode>('list');

  useEffect(() => {
    defaultRef.current = defaultTitle;
    setCurrentTitle(defaultTitle);
    setMode('list');
  }, [defaultTitle]);

  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as TypedEvent;
      if (detail?.lang && detail.lang !== lang) return;

       const incomingMode = detail?.mode;
       if (incomingMode) setMode(incomingMode);

      const nextTitle = detail?.title;
      if (typeof nextTitle === 'string' && nextTitle.trim().length > 0) {
        setCurrentTitle(nextTitle);
        return;
      }

      setCurrentTitle(defaultRef.current);
      if (!incomingMode) setMode('list');
    };

    window.addEventListener(CAREERS_ACTIVE_JOB_EVENT, handler as EventListener);
    return () => window.removeEventListener(CAREERS_ACTIVE_JOB_EVENT, handler as EventListener);
  }, [lang]);

  const showExtras = mode === 'list';

  return (
    <>
      <Title>
        <p className={className}>{currentTitle}</p>
      </Title>
      {showExtras && subtitleHtml && (
        <Description
          html={subtitleHtml}
          className={subtitleClassName}
        />
      )}
      {showExtras && descriptionHtml && (
        <Description
          html={descriptionHtml}
          className={descriptionClassName}
        />
      )}
    </>
  );
}
