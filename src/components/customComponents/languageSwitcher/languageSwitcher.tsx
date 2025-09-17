'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import FullPageLoader from '../../atoms/fullPageLoader/fullPageLoader';
import { useDismissable } from '../../../utils/hooks/useDismissable';

export default function LanguageSwitcher() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentLang, setCurrentLang] = useState('en');
  const [langSubMenuShown, setLangSubMenuShown] = useState(false);

  const containerRef = useDismissable<HTMLDivElement>(langSubMenuShown, () =>
    setLangSubMenuShown(false),
  );

  const supportedLanguages = process.env.NEXT_PUBLIC_SUPPORTED_CULTURES?.split(',').map((lang) =>
    lang.trim(),
  ) || ['en', 'ar'];

  useEffect(() => {
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    const urlLangCandidate = pathname?.split('/')[1] || 'en';
    const urlLang = supportedLanguages.includes(urlLangCandidate) ? urlLangCandidate : 'en';
    setCurrentLang(storedLang || urlLang);
  }, [pathname]);

  const handleRedirect = (lang: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('language', lang);
    const segments = pathname.split('/').filter(Boolean);
    if (supportedLanguages.includes(segments[0])) segments.shift();
    const normalizedPath = '/' + segments.join('/');
    const queryString = searchParams.toString();
    window.location.href = `/${lang}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
  };

  const onChange = (language: string) => {
    setIsPageLoading(true);
    setTimeout(() => {
      setLangSubMenuShown(false);
      setCurrentLang(language);
      handleRedirect(language);
    }, 500);
  };

  const getCustomLabel = (lang: string): string =>
    lang.toLowerCase() === 'en'
      ? 'En'
      : lang.toLowerCase() === 'ar'
        ? 'العربية'
        : lang.toUpperCase();

  if (isPageLoading) return <FullPageLoader />;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setLangSubMenuShown((s) => !s)}
        className="cursor-pointer uppercase"
        aria-haspopup="listbox"
        aria-expanded={langSubMenuShown}
        aria-label="Change language"
      >
        <div className="flex items-center gap-2 p-2 transition">
          {getCustomLabel(currentLang)}
          <svg
            className={`h-4 w-4 transition-transform ${langSubMenuShown ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {langSubMenuShown && (
        <div
          role="listbox"
          className="absolute mt-2 text-black bg-white border border-gray-300 rounded shadow-lg min-w-32 right-0"
        >
          {supportedLanguages.map((lang) => (
            <div
              role="option"
              aria-selected={currentLang === lang}
              key={lang}
              className="py-2 px-4 cursor-pointer hover:bg-[#E6E8FF]"
              onClick={() => onChange(lang)}
            >
              {getCustomLabel(lang)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

