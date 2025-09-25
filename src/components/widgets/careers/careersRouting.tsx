'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CareersBoard, { type CareersSearchBody } from './careersBoard';
import JobDetails from './JobDetails';

type Labels = {
  vacanciesLabel?: string;
  locationLabel?: string;
  departmentLabel?: string;
};

type ModuleCareer = {
  Id: string;
  Title?: string;
  EmploymentType?: string;
  Date?: string;
  Department?: { Id?: string; Title?: string } | { Id?: string; Title?: string }[] | null;
  Location?: { Title?: string } | { Title?: string }[] | null;
  DetailUrl?: string;
  ApplyUrl?: string;
};

export default function CareersRouting({
  labels,
  careers,
  initialBody,
}: {
  language?: string;
  dir?: 'rtl' | 'ltr' | 'auto';
  labels: Labels;
  careers: ModuleCareer[];
  initialBody?: Partial<CareersSearchBody>;
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
      <section className="w-full">
        <div className="mx-20 my-4">
          <button
            onClick={backToList}
            className="rounded-2xl bg-[#010663] px-4 py-2 font-medium text-white hover:opacity-90"
          >
            ← Back to careers
          </button>
        </div>
        <JobDetails id={jobId} />
      </section>
    );
  }

  return (
    <section className="w-full">
      <CareersBoard
        labels={labels}
        careers={careers}
        onOpenJob={openJob}
        initialBody={initialBody}
      />
    </section>
  );
}

