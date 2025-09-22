'use client';

import React from 'react';
import Image from 'next/image';

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
  dir?: 'rtl' | 'ltr' | 'auto';
};

export default function JobCard({ job, className, dir = 'ltr' }: Props) {
  return (
    <article
      dir={dir}
      className="
        w-[274px] h-[218px] p-6 rounded-xl bg-white 
        shadow-sm hover:shadow-md transition overflow-hidden
        flex flex-col items-center justify-between gap-4"
    >
      {/* Header */}
      <div className="h-10 w-10 rounded-xl">
        <span className="text-xl">
          <Image
            src="/icons/job_icon.png"
            alt="No jobs available"
            width={64}
            height={64}
            className="mb-6 opacity-70"
          />
        </span>
      </div>

      {/* Title + Location */}
      <div className="flex flex-col items-center justify-center ">
        <h3 className="text-xl font-bold leading-tight">{job.title}</h3>
        <div className="mt-1 font-semibold text-gray-600">
          <span></span>
          {job.location}
        </div>
      </div>

      {/* Footer tags */}
      <div className="flex items-center gap-2 text-14px">
        <span className="rounded-full bg-[#E1F3F9] px-3 py-2">{job.workType}</span>
        <span className="rounded-full bg-[#E1F3F9] px-3 py-2">{job.postedDaysAgo} days ago</span>
      </div>
    </article>
  );
}

