'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';
import { useDirection, formatDaysAgo } from '../../../utils/helpers';
import { emitCareersActiveJob } from '../../../utils/careersEvents';
import BreifCasiIcon from '../../../../public/icons/breif-case.svg';

type Job = {
  id: string;
  title: string;
  location: string;
  workType: string;
  postedDaysAgo: number;
};

type Props = {
  job: Job;
  className?: string;
  onOpen?: (id: string) => void;
};

export default function JobCard({ job, onOpen }: Props) {
  const router = useRouter();
  const { post } = useSfMutation('api/default/careers/details');
  const [loading, setLoading] = React.useState(false);

  const dir = useDirection();
  const isRtl = dir === 'rtl';

  const jobLang: 'en' | 'ar' = isRtl ? 'ar' : 'en';

  const goToDetails = async () => {
    emitCareersActiveJob({ lang: jobLang, title: job.title, mode: 'details' });

    if (onOpen) return onOpen(job.id);

    try {
      setLoading(true);
      await post({ id: job.id, language: 'en' });
      router.push(`/careers/details/${job.id}`);
    } catch (err) {
      console.error('details fetch failed; navigating anyway', err);
      router.push(`/careers/details/${job.id}`);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToDetails();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={onKey}
      className="
        mx-auto w-[336.67px] h-[218px] md:w-[274px] md:h-[218px] p-6 rounded-xl bg-surface-section
        shadow-md hover:shadow-md transition overflow-hidden
        flex flex-col items-center gap-4 "
      aria-busy={loading}
      aria-label={`${job.title} - ${job.location}`}
    >
      <div className="h-10 w-10 p-6 rounded-xl bg-[#E6E8FF] dark:bg-[#A6EFD9] m-auto flex  items-center justify-center">
        <span className="text-xl">
          <BreifCasiIcon className="text-[#010663]" />
        </span>
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        {/* Title: up to 2 lines, then ellipsis; allow breaking long words */}
        <h3
          className="
            text-[20px] leading-[28px] font-bold text-center font-lufga 
            truncate whitespace-nowrap overflow-hidden
            max-w-full
          "
        >
          {job.title}
        </h3>

        {/* Location row: allow truncation in flex by giving min-w-0 */}
        <div className="mt-1 flex w-full min-w-0 items-center justify-center gap-2 font-semibold text-gray-600 text-[14px] leading-[20px] font-lufga">
          <Image
            src="/icons/map-pin.png"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 object-contain dark:invert shrink-0"
          />
          {/* Single-line ellipsis; break-words for super-long tokens; hyphenation for Arabic/long words */}
          <span className="truncate break-words hyphens-auto text-default">{job.location}</span>
        </div>
      </div>

      <div
        className={`mt-auto flex items-center gap-2 text-[14px] leading-[20px] ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <span className="rounded-full px-3 py-2 bg-surface-sheet dark:text-white whitespace-nowrap font-lufga">
          {job.workType}
        </span>
        <span className="rounded-full px-3 py-2 bg-surface-sheet dark:text-white whitespace-nowrap font-lufga">
          {formatDaysAgo(job.postedDaysAgo, isRtl ? 'ar' : 'en')}
        </span>
      </div>
    </article>
  );
}

