'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import JobDetails from './details/jobDetailss';
import ApplyForJob from './applyForJob/applyForJob';
import CareersBoard from './careersDashboard/careersBoard';
import { type CareersSearchBody, type ModuleCareer } from '../../../types/typee';
type Labels = { vacanciesLabel?: string; locationLabel?: string; departmentLabel?: string };

type EntityLike = {
  ApplyForm?: any;
  CityChoices?: any[];
};

type Props = {
  language?: string;
  dir?: 'rtl' | 'ltr' | 'auto';
  labels: Labels;
  careers: ModuleCareer[];
  initialBody?: Partial<CareersSearchBody>;
  entity?: EntityLike;
};

export default function CareersRouting({ labels, careers, entity, language }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const jobId = search.get('job') ?? '';
  const isApplying = search.get('apply') === '1';

  const buildUrl = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const params = new URLSearchParams(search);
      mutate(params);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, search],
  );

  const openJob = useCallback(
    (id: string) => {
      if (jobId === id && !isApplying) return;
      router.push(
        buildUrl((page) => {
          page.set('job', id);
          page.delete('apply');
        }),
        { scroll: false },
      );
    },
    [router, buildUrl, jobId, isApplying],
  );

  const goToApply = useCallback(
    (id: string) => {
      router.push(
        buildUrl((p) => {
          p.set('job', id);
          p.set('apply', '1');
        }),
        { scroll: false },
      );
    },
    [router, buildUrl],
  );

  const content = useMemo(() => {
    if (jobId && isApplying) {
      return (
        <ApplyForJob
          className="mb-12"
          backHref={buildUrl((page) => {
            page.set('job', jobId);
            page.delete('apply');
          })}
          form={entity?.ApplyForm}
          cities={entity?.CityChoices}
          jobId={jobId}
          language={language}
        />
      );
    }

    if (jobId) {
      return (
        <>
          <JobDetails id={jobId} onApply={() => goToApply(jobId)} onOpenJob={openJob} />
        </>
      );
    }

    return <CareersBoard labels={labels} careers={careers} onOpenJob={openJob} />;
  }, [jobId, isApplying, labels, careers, entity, language, buildUrl, goToApply, openJob]);

  return <section className="mx-auto w-full">{content}</section>;
}

