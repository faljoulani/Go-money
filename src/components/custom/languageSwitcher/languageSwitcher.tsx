'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import FullPageLoader from '../../atoms/fullPageLoader/FullPageLoader';

export default function LanguageSwitcher() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentLang, setCurrentLang] = useState('en');

  const supportedLanguages = process.env.NEXT_PUBLIC_SUPPORTED_CULTURES?.split(',').map((lang) =>
    lang.trim(),
  ) || ['en', 'ar'];

  useEffect(() => {
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    const urlLangCandidate = pathname?.split('/')[1] || 'en';
    const urlLang = supportedLanguages.includes(urlLangCandidate) ? urlLangCandidate : 'en';
    setCurrentLang(storedLang || urlLang);
  }, [pathname]);

  const handleRedirect = (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
    const segments = pathname.split('/').filter(Boolean);
    if (supportedLanguages.includes(segments[0])) {
      segments.shift();
    }
    const normalizedPath = '/' + segments.join('/');
    const queryString = searchParams.toString();
    const newUrl = `/${lang}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
    console.log('Redirecting to:', newUrl);
    window.location.href = newUrl;
  };

  const onChange = (language) => {
    setIsPageLoading(true);
    setTimeout(() => {
      setLangSubMenuShown(false);
      setCurrentLang(language);
      handleRedirect(language);
    }, 500);
  };

  const [langSubMenuShown, setLangSubMenuShown] = useState(false);

  const showLangSubMenu = () => {
    setLangSubMenuShown(!langSubMenuShown);
  };
  const getCustomLabel = (lang: string): string => {
    switch (lang.toLowerCase()) {
      case 'en':
        return 'En';
      case 'ar':
        return 'العربية';
      default:
        return lang.toUpperCase();
    }
  };

  if (isPageLoading) {
    return <FullPageLoader />;
  }
  return (
    <div>
      <div className=" cursor-pointer uppercase" onClick={showLangSubMenu}>
        <div className="flex items-center gap-2 p-2 transition">
          {getCustomLabel(currentLang)}
          <svg
            className={`h-4 w-4 transition-transform `}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      {langSubMenuShown && (
        <div className="absolute mt-2 text-black bg-white border border-gray-300 rounded shadow-lg">
          {supportedLanguages.map((lang) => (
            <div
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

