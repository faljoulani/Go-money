'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';

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

  const goToDetails = async () => {
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
        mx-auto w-full md:w-[274px] md:h-[218px] p-6 rounded-xl bg-white 
        shadow-sm hover:shadow-md transition overflow-hidden
        flex flex-col items-center justify-between gap-4"
      aria-busy={loading}
      aria-label={`${job.title} - ${job.location}`}
    >
      <div className="h-10 w-10 rounded-xl">
        <span className="text-xl">
          <Image
            src="/icons/job_icon.png"
            alt="Job"
            width={64}
            height={64}
            className="mb-6 opacity-70"
          />
        </span>
      </div>

      <div className="flex flex-col items-center justify-center ">
        <h3 className="text-xl font-bold leading-tight">{job.title}</h3>
        <div className="mt-1 flex w-full items-center justify-start gap-2 font-semibold text-gray-600">
          <Image
            src="/icons/map-pin.png"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 object-contain"
          />
          <span className="flex-1">{job.location}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-14px">
        <span className="rounded-full bg-[#E1F3F9] px-3 py-2">{job.workType}</span>
        <span className="rounded-full bg-[#E1F3F9] px-3 py-2">{job.postedDaysAgo} days ago</span>
      </div>
    </article>
  );
}

