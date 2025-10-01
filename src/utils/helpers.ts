import { useState, useEffect } from 'react';

export function useDirection(): 'rtl' | 'ltr' {
  const [dir, setDir] = useState<'rtl' | 'ltr'>('ltr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const htmlDir = document.documentElement.getAttribute('dir');
      setDir(htmlDir === 'rtl' ? 'rtl' : 'ltr');
    }
  }, []);

  return dir;
}

export function formatDaysAgo(days: number, lang: 'en' | 'ar'): string {
  if (lang === 'en') {
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }
  // Arabic
  if (days <= 0) return 'اليوم';
  if (days === 1) return 'منذ يوم';
  if (days === 2) return 'منذ يومين';
  if (days >= 3 && days <= 10) return `منذ ${days} أيام`;
  return `منذ ${days} يوماً`;
}

