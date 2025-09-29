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
  Error: string | null;
  Data: {
    SourceJobId: string;
    Language: string;
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
  console.log('Similar Jobs COMPONENT');
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

    const fetchDepartmentId = async () => {
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

        if (!cancelled && match.DepartmentId !== departmentId) {
          setDepartmentId(match.DepartmentId);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to resolve department.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDepartmentId();
    return () => {
      cancelled = true;
    };
  }, [jobId, departmentIdProp, departmentId, language]);
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
        const response: SimilarResponse = await postSimilarRef.current({
          id: departmentId,
          language,
        });

        if (!cancelled) {
          setData(response);
          lastKeyRef.current = key;
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load similar jobs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, departmentId, language]);

  const items = data?.Data?.Items ?? [];
  const filteredItems = useMemo(() => items.filter((job) => job.Id !== jobId), [items, jobId]);
  const headingText =
    language === 'ar' ? 'وظائف مماثلة قد تكون مهتمًا بها' : 'Similar jobs you may be interested in';

  return (
    <section className="mt-12 mb-20 opacity-100 flex flex-col gap-8 overflow-hidden">
      <h3 className="text-2xl font-bold text-primary text-center">{headingText}</h3>

      {loading && <div className="py-8 text-gray-500">Loading…</div>}
      {error && <div className="rounded-xl border bg-white p-4 text-red-700">{error}</div>}

      {!loading && !error && departmentId && filteredItems.length === 0 && (
        <div className="text-gray-600">No similar jobs found.</div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-4 gap-8 self-start">
          {filteredItems.slice(0, 8).map((job) => (
            <div key={job.Id} className="h-[218px]">
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
      )}
    </section>
  );
}

