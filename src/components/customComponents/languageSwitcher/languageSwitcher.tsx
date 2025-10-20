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

  const supportedLanguages = process.env.NEXT_PUBLIC_SUPPORTED_CULTURES?.split(',')
    .map((lang) => lang.trim().toLowerCase())
    .filter(Boolean) || ['en', 'ar'];

  const defaultCulture = (process.env.NEXT_PUBLIC_DEFAULT_CULTURE || 'en').toLowerCase();
  const prefixDefault =
    (process.env.NEXT_PUBLIC_PREFIX_DEFAULT_CULTURE || 'false').toString().toLowerCase() === 'true';

  const normalizePathWithoutLang = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length && supportedLanguages.includes(segments[0].toLowerCase())) {
      segments.shift();
    }
    return '/' + segments.join('/');
  };

  const buildHrefForLang = (lang: string) => {
    const normalizedPath = normalizePathWithoutLang(pathname || '/');
    const qs = searchParams?.toString() || '';
    const needsPrefix = lang !== defaultCulture || prefixDefault;
    const prefixedPath = needsPrefix ? `/${lang}${normalizedPath}` : normalizedPath;
    return `${prefixedPath}${qs ? `?${qs}` : ''}`;
  };

  const buildHomeHrefForLang = (lang: string) => {
    const needsPrefix = lang !== defaultCulture || prefixDefault;
    return needsPrefix ? `/${lang}` : '/';
  };

  useEffect(() => {
    // Detect if we're in Sitefinity edit/preview mode
    const isEditMode = typeof window !== 'undefined' && (
      window.location.search.includes('sfaction=') ||
      window.location.search.includes('sf_site=') ||
      window.location.search.includes('sf-content-action=') ||
      window.location.pathname.includes('/Sitefinity/') ||
      window.location.pathname.includes('/sfrenderer/')
    );

    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    const urlFirst = pathname?.split('/')[1]?.toLowerCase();
    const urlLang = supportedLanguages.includes(urlFirst || '')
      ? (urlFirst as string)
      : defaultCulture;

    // Determine the effective language (stored preference takes priority)
    const effectiveLang = (storedLang || urlLang || defaultCulture).toLowerCase();
    setCurrentLang(effectiveLang);

    // Skip redirect logic in edit/preview mode to avoid breaking CMS functionality
    if (isEditMode) {
      return;
    }

    // If user has a language preference that doesn't match the URL, redirect
    if (storedLang && storedLang.toLowerCase() !== urlLang) {
      const href = buildHrefForLang(storedLang.toLowerCase());
      const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      // Only redirect if the built href is different from current URL
      if (href !== currentUrl) {
        setIsPageLoading(true);
        window.location.replace(href);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleRedirect = (lang: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('language', lang);
    const href = buildHomeHrefForLang(lang.toLowerCase());
    window.location.assign(href);
  };

  const onChange = (language: string) => {
    setIsPageLoading(true);
    setLangSubMenuShown(false);
    setCurrentLang(language);
    handleRedirect(language);
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
        <div className="flex items-center gap-2 p-2 transition font-cairo">
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
          className="absolute mt-2 bg-secondary rounded-xl shadow-xl border border-white/20 min-w-32 right-0 p-2"
        >
          {supportedLanguages.map((lang) => (
            <div
              role="option"
              aria-selected={currentLang === lang}
              key={lang}
              className={`${lang == 'ar' && 'font-cairo'} rounded-lg px-3 py-2 cursor-pointer text-default hover:text-[#000]  hover:bg-[#E6E8FF] dark:hover:bg-[#A6EFD9]`}
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

