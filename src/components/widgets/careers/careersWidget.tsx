'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CareersBoard from './careerBoards';
import JobDetails from './JobDetails';

export default function CareersWidget({
  language = 'en',
  dir = 'ltr',
}: {
  language?: string;
  dir?: 'rtl' | 'ltr' | 'auto';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const jobId = search.get('job');

  const openJob = useCallback(
    (id: string) => {
      if (jobId === id) return;
      const params = new URLSearchParams(search.toString());
      params.set('job', id);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, jobId, search],
  );

  const backToList = useCallback(() => {
    if (!jobId) return;
    const params = new URLSearchParams(search.toString());
    params.delete('job');
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [router, pathname, jobId, search]);

  if (jobId) {
    return (
      <section dir={dir} className="w-full">
        <div className="mx-20 my-4">
          <button
            onClick={backToList}
            className="rounded-2xl bg-[#010663] px-4 py-2 font-medium text-white hover:opacity-90"
          >
            ← Back to careers
          </button>
        </div>
        <JobDetails id={jobId} language={language} dir={dir} />
      </section>
    );
  }

  return (
    <section dir={dir} className="w-full">
      <CareersBoard dir={dir} onOpenJob={openJob} />
    </section>
  );
}

