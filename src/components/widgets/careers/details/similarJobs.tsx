'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import JobCard from '../../../atoms/jobCard/jobCard';
import { useSfMutation } from '../../../../utils/hooks/useSfMutation';

type SearchResponse = {
  Success: boolean;
  Error: string | null;
  Data?: {
    Items: Array<{
      Id: string;
      Title: string;
      DepartmentId: string;
      DepartmentName: string;
      LocationName: string;
      EmploymentType: string;
      PostedAtUtc: string;
      PostedAgoDays: number;
      ApplyUrl: string;
    }>;
  };
};

type SimilarResponse = {
  Success: boolean;
  Error: { Code?: string; Message?: string } | string | null;
  TraceId?: string;
  Data?: {
    SourceJobId?: string;
    Language?: string;
    Items: Array<{
      Id: string;
      Title: string;
      LocationName: string;
      EmploymentType: string;
      PostedAgoDays: number;
      ApplyUrl: string;
    }>;
  };
};

export type SimilarJobsProps = {
  jobId: string;
  departmentId?: string;
  onOpenJob?: (id: string) => void;
};

export default function SimilarJobs({
  jobId,
  departmentId: departmentIdProp,
  onOpenJob,
}: SimilarJobsProps) {
  const [language, setLanguage] = useState<'en' | 'ar' | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const computeLang = () => (document.documentElement.dir === 'rtl' ? 'ar' : 'en') as 'en' | 'ar';
    setLanguage(computeLang());
    const obs = new MutationObserver(() => setLanguage(computeLang()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => obs.disconnect();
  }, []);

  const { post: postSimilar } = useSfMutation('api/default/careers/similar');
  const postSimilarRef = useRef(postSimilar);
  useEffect(() => {
    postSimilarRef.current = postSimilar;
  }, [postSimilar]);

  const [departmentId, setDepartmentId] = useState<string | null>(departmentIdProp ?? null);
  const [data, setData] = useState<SimilarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (departmentIdProp && departmentIdProp !== departmentId) {
      setDepartmentId(departmentIdProp);
      setError(null);
      setData(null);
    }
  }, [departmentIdProp, departmentId]);

  useEffect(() => {
    if (!language) return;
    if (departmentIdProp) return;

    let cancelled = false;
    setError(null);
    setData(null);

    (async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/default/careers/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 1, pageSize: 25, language }),
        });
        if (!response.ok) throw new Error(`Search failed (${response.status})`);

        const json: SearchResponse = await response.json();
        const items = json?.Data?.Items ?? [];
        const match = items.find((item) => item.Id === jobId);

        if (!match?.DepartmentId) {
          throw new Error('Could not resolve DepartmentId for this job.');
        }

        if (!cancelled) setDepartmentId(match.DepartmentId);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to resolve department.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobId, departmentIdProp, language]);

  const key = useMemo(
    () => (departmentId && language ? `${departmentId}:${language}` : ''),
    [departmentId, language],
  );
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!departmentId || !language) return;
    if (lastKeyRef.current === key) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res: SimilarResponse = await postSimilarRef.current({
          id: departmentId,
          language,
        });

        if (cancelled) return;
        lastKeyRef.current = key;

        if (res?.Success === false) {
          const msg =
            (typeof res.Error === 'string' ? res.Error : res?.Error?.Message) ||
            'An unexpected error occurred. Please try again later.';
          const trace = res?.TraceId ? ` (TraceId: ${res.TraceId})` : '';
          setError(`${msg}${trace}`);
          setData(null);
          return;
        }

        setData(res);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || 'Failed to load similar jobs.');
        setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, departmentId, language]);

  const items = data?.Data?.Items ?? [];
  const filteredItems = useMemo(() => items.filter((j) => j.Id !== jobId), [items, jobId]);

  const headingText =
    language === 'ar' ? 'وظائف مماثلة قد تكون مهتمًا بها' : 'Similar jobs you may be interested in';

  return (
    <section className="mt-10 mb-16 md:px-0">
      <h3 className="text-center text-2xl md:text-4xl font-bold md:text-primary">{headingText}</h3>

      {loading && <div className="py-8 text-center text-gray-500">Loading…</div>}

      {error && (
        <div className="mt-6 rounded-2xl border border-neutral-200/70 bg-white p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && departmentId && filteredItems.length === 0 && (
        <div className="mt-6 text-center text-gray-600">
          {language === 'ar' ? 'لا توجد وظائف مشابهة.' : 'No similar jobs found.'}
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="mt-6 rounded-3xl bg-neutral-50 md:py-6">
          {/* Mobile: 1 col, then 2/3/4 as viewport grows */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {filteredItems.slice(0, 8).map((job) => (
              <div key={job.Id} className="mx-auto w-full max-w-[560px]">
                <JobCard
                  job={{
                    id: job.Id,
                    title: job.Title,
                    location: job.LocationName,
                    workType: job.EmploymentType,
                    postedDaysAgo: job.PostedAgoDays ?? 0,
                  }}
                  onOpen={onOpenJob}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

