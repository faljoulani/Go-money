'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSfMutation } from '../../../../utils/hooks/useSfMutation';
import SimilarJobs from './similarJobs';


import type { DetailsResponse, JobDetailsProps } from '../../../../types/typee';
import FullPageLoader from '../../../atoms/fullPageLoader/fullPageLoader';

export default function JobDetails({ id, className, onOpenJob, onApply }: JobDetailsProps) {
  console.log('JOB DETAILS COMPONENT');
  const { post: postDetails } = useSfMutation('api/default/careers/details');
  const postDetailsRef = useRef(postDetails);
  useEffect(() => {
    postDetailsRef.current = postDetails;
  }, [postDetails]);

  const [language, setLanguage] = useState<'en' | 'ar' | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const computeLang = () => (document.documentElement.dir === 'rtl' ? 'ar' : 'en') as 'en' | 'ar';
    setLanguage(computeLang());

    const obs = new MutationObserver(() => setLanguage(computeLang()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => obs.disconnect();
  }, []);

  const [data, setData] = useState<DetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => (language ? `${id}:${language}` : ''), [id, language]);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id || !language) return;
    if (lastKeyRef.current === key) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res: DetailsResponse = await postDetailsRef.current({ id, language });

        if (!cancelled) {
          setData(res);
          lastKeyRef.current = key;
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load job details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, id, language]);

  if (loading || !language) return <FullPageLoader />;

  const job = data?.Data;
  console.log('JOB ' + JSON.stringify(job));
  if (error || !job) {
    return (
      <section className="w-full mx-20 py-10">
        <div className="rounded-3xl border bg-white p-6 text-red-700">
          {error || 'No details found'}
        </div>
      </section>
    );
  }

  const responsibilitiesHtml = job.Sections?.KeyResponsibilitiesHtml;
  const qualificationsHtml = job.Sections?.QualificationsHtml;
  const overviewHtml = job.Sections?.OverviewHtml || '';

  return (
    <section className={`w-full py-16 px-20 ${className ?? ''}`}>
      <div className="grid grid-cols-[2fr,1fr] gap-8">
        {/* Left column */}
        <div className="w-full rounded-3xl border bg-white px-8 space-y-4">
          {/* Overview */}
          <div className="my-6 p-5">
            <h3 className="mb-1 text-2xl font-semibold text-primary">
              {job.Sections?.OverviewLabel || 'Overview'}
            </h3>
            <div
              className="leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: overviewHtml }}
            />
          </div>

          {/* Responsibilities */}
          {responsibilitiesHtml && (
            <div className="my-6 p-5">
              <h3 className="mb-1 text-2xl font-semibold text-primary">
                {job.Sections?.KeyResponsibilitiesLabel || 'Key Responsibilities'}
              </h3>
              <div
                className="mt-3 text-gray-700"
                dangerouslySetInnerHTML={{ __html: responsibilitiesHtml }}
              />
            </div>
          )}

          {/* Qualifications */}
          {qualificationsHtml && (
            <div className="my-6 p-5">
              <h3 className="mb-1 text-2xl font-semibold text-primary">
                {job.Sections?.QualificationsLabel || 'Qualifications'}
              </h3>
              <div
                className="mt-3 text-gray-700"
                dangerouslySetInnerHTML={{ __html: qualificationsHtml }}
              />
            </div>
          )}

          {/* Skills */}
          {Array.isArray(job.Skills) && job.Skills.length > 0 && (
            <div className="my-6 p-5">
              <h3 className="mb-1 text-2xl font-semibold text-primary">
                {job.Sections?.SkillsLabel || 'Skills'}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.Skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-[#E1F3F9] px-3 py-1 text-sm text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <aside className="max-w-sm">
          <div className="top-4 flex flex-col gap-6 rounded-3xl border bg-white p-8">
            {/* Location row */}
            <div className="flex items-start gap-3">
              <Image
                src="/icons/map-pin.png"
                alt="Location"
                width={48}
                height={48}
                className="opacity-80"
              />
              <div>
                <div className="text-[18px] font-bold">Location</div>
                <div>{job.LocationName}</div>
              </div>
            </div>

            <div>
              {job.ShortMessage ||
                'Please send us your detailed CV to apply for this job or click on apply now'}
            </div>

            <div className="mt-6 space-y-5">
              {(job.ContactInfo?.length
                ? job.ContactInfo
                : [
                    { Title: 'Contact email', Info: 'careers@gomoney.com' },
                    { Title: 'Industry', Info: 'Information Technology & Services' },
                    { Title: 'Job type', Info: job.EmploymentType || 'Full time' },
                    { Title: 'Posted', Info: '' },
                  ]
              ).map((row, idx) => {
                const iconSrc = iconFor(row.Title);
                return (
                  <div key={`${row.Title}-${idx}`} className="flex items-start gap-3">
                    <Image
                      src={iconSrc}
                      alt={row.Title}
                      width={48}
                      height={48}
                      className="opacity-80"
                    />
                    <div>
                      <div className="text-[18px] font-bold">{row.Title}</div>
                      <div>{row.Info}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {job.ApplyUrl && !onApply ? (
              <Link
                href={job.ApplyUrl}
                className="mt-6 w-full rounded-2xl bg-[#010663] px-4 py-3 text-center font-medium text-white hover:opacity-90"
              >
                {job.ButtonLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onApply?.(id)}
                className="mt-6 w-full rounded-2xl bg-[#010663] px-4 py-3 text-center font-medium text-white hover:opacity-90"
              >
                {job.ButtonLabel || 'Apply for this job'}
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Note: If SimilarJobs also calls an API, consider applying the same language logic there. */}
      <SimilarJobs jobId={id} departmentId={job.DepartmentId} onOpenJob={onOpenJob} />
    </section>
  );
}

function iconFor(title: string) {
  const key = (title || '').toLowerCase();
  if (key.includes('contact')) return '/icons/phone_job_icon.png';
  if (key.includes('industry')) return '/icons/industry_icon.png';
  if (key.includes('job type')) return '/icons/job_icon.png';
  if (key.includes('posted')) return "/icons/o'clock_job_icon.png";
  return '/icons/job_icon.png';
}

