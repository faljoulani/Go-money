'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';
import InputField from '../../atoms/inputField/inputField';
import SpinnerLoader from '../../atoms/spinnerLoader/spinnerLoader';

type CareerDetails = {
  Title?: string;
  DepartmentName?: string;
  LocationName?: string;
  EmploymentType?: string;
  Sections?: {
    OverviewHtml?: string;
  };
};

type Props = {
  className?: string;
  backHref?: string;
  form?: any;
  cities?: any[];
  jobTitle?: string;
  jobId?: string;
  language?: string;
};

type CityItem = { Key?: string; Value?: string };
type FormDataState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  coverLetter: string;
  resume?: File | null;
};

const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
const maxBytes = 2 * 1024 * 1024;

const linkHref = (v: any, fb = '/careers'): string =>
  typeof v === 'string' ? v : (v?.Href ?? v?.Url ?? fb);

const citiesFrom = (form?: any, overrideCities?: any[]): CityItem[] => {
  const a: CityItem[] = Array.isArray(form?.CityChoices) ? form.CityChoices : [];
  const b: CityItem[] = Array.isArray(overrideCities) ? overrideCities : [];
  const src = a.length ? a : b;
  return src.map((c: any) => ({ Key: c?.Key ?? c?.key, Value: c?.Value ?? c?.value }));
};

function ApplicationSuccess({
  backHref = '/careers',
  ctaText = 'Back to career',
}: {
  backHref?: string;
  ctaText?: string;
}) {
  return (
    <div className="rounded-3xl border bg-white px-16 py-16 text-center">
      <div className="mx-auto flex items-center justify-center">
        <span
          className="block h-[83px] w-[83px] bg-[#56D38C]"
          style={{
            WebkitMaskImage: 'url(/icons/circle-check-filled.png)',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskImage: 'url(/icons/circle-check-filled.png)',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
          aria-hidden
        />
      </div>

      <h2 className="mb-6 text-4xl font-extrabold text-primary">
        Your application has been submitted successfully.
      </h2>

      <p className="mb-6 text-14px text-default">
        We’ll review your application and get back to you soon.
      </p>

      <Link
        href={backHref}
        className="inline-flex items-center gap-3 rounded-3xl bg-primary px-6 py-3 font-medium text-white hover:opacity-90"
      >
        {ctaText}
        <Image
          src="/icons/chevron-right.svg"
          alt=""
          width={24}
          height={24}
          className="h-5 w-5 shrink-0 invert"
        />
      </Link>
    </div>
  );
}

export default function ApplyForJob({
  className,
  backHref = '/careers',
  form,
  cities,
  jobTitle,
  jobId,
  language = 'en',
}: Props) {
  const { post: submitApplication } = useSfMutation('api/default/applyjob');
  const { post: fetchJobDetails } = useSfMutation('api/default/careers/details');

  const [jobDetails, setJobDetails] = useState<CareerDetails | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const loading = Boolean(jobId && !jobError && !jobDetails);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FormDataState>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    coverLetter: '',
    resume: null,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ctaUrl = linkHref(form?.CtaUrl, backHref);
  const cityChoices = citiesFrom(form, cities);

  const applyFieldChange = <K extends keyof FormDataState>(key: K, value: FormDataState[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleResume = (file?: File | null) => {
    if (!file) return;
    const err = !allowedTypes.includes(file.type)
      ? 'Supported formats: PDF, JPG, PNG.'
      : file.size > maxBytes
        ? 'Maximum file size is 2MB.'
        : null;
    setError(err);
    if (!err) {
      applyFieldChange('resume', file);
    }
  };

  useEffect(() => {
    setJobError(null);
    setJobDetails(null);

    if (!jobId) return;

    let cancelled = false;
    async function load() {
      try {
        const response: any = await fetchJobDetails({ id: jobId, language });
        if (cancelled) return;

        if (!response?.Success || !response?.Data) {
          setJobError(response?.Error || 'Failed to load job details.');
          return;
        }

        setJobDetails(response.Data as CareerDetails);
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load job details:', e);
          setJobError('Failed to load job details. Please try again.');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId, language, fetchJobDetails]);

  const title = jobDetails?.Title || jobTitle;
  const department = jobDetails?.DepartmentName ?? '';
  const location = jobDetails?.LocationName ?? '';
  const employmentType = jobDetails?.EmploymentType ?? '';
  const overviewHtml = jobDetails?.Sections?.OverviewHtml ?? '';
  const submissionTitle = title || 'Job Application';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const formElement = e.currentTarget;
    const ok = formElement.checkValidity() && !error;
    if (!ok) {
      formElement.reportValidity();
      return;
    }
    if (!data.resume) {
      setError('Please attach your resume (PDF/JPG/PNG, max 2MB).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('Title', submissionTitle);
      payload.append('FirstName', data.firstName);
      payload.append('LastName', data.lastName);
      payload.append('City', data.city);
      payload.append('PhoneNumber', data.phone);
      payload.append('Email', data.email);
      payload.append('CoverLetter', data.coverLetter);
      payload.append('Language', language || 'en');
      if (data.resume) payload.append('Resume', data.resume, data.resume.name);

      await submitApplication(payload);
      setSubmitted(true);
    } catch (err: any) {
      console.error('ApplyJob error:', err);
      setServerError('Something went wrong while submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SpinnerLoader show={loading} message="Loading job details...">
      <section className={`w-full space-y-6 mx-auto px-6 py-10 md:px-20 ${className ?? ''}`}>
        {jobError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {jobError}
          </div>
        )}

        {jobDetails && (
          <div
            className={[
              'w-full rounded-2xl bg-white p-6 shadow-sm',
              'border border-neutral-200/70',
              className,
            ].join(' ')}
          >
            <h1 className="text-2xl font-bold tracking-tight leading-[100%] text-primary">
              {title}
            </h1>

            {(department || location || employmentType) && (
              <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-neutral-600">
                {department && (
                  <div className="flex items-center gap-2">
                    <Image src="/icons/industry_icon.png" alt="industry" width={24} height={24} />
                    <span className="font-medium">{department}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <Image src="/icons/map-pin.png" alt="Location" width={24} height={24} />
                    <span>{location}</span>
                  </div>
                )}
                {employmentType && (
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons/o'clock_job_icon.png"
                      alt="Employment Type"
                      width={24}
                      height={24}
                    />
                    <span>{employmentType}</span>
                  </div>
                )}
              </div>
            )}

            {overviewHtml && (
              <div className="mt-6">
                <div
                  className="prose max-w-none text-neutral-700"
                  dangerouslySetInnerHTML={{ __html: overviewHtml }}
                />
              </div>
            )}
          </div>
        )}

        {submitted ? (
          <section aria-live="polite">
            <ApplicationSuccess backHref={ctaUrl} ctaText={form?.CtaText} />
          </section>
        ) : (
          <form
            noValidate
            onSubmit={onSubmit}
            className="rounded-2xl border bg-white p-7 shadow-sm"
          >
            <h2 className="mt-1 text-2xl font-bold leading-tight text-primary">
              {form?.Title ?? 'Application form'}
            </h2>
            <p className="mt-2 mb-6 text-sm text-gray-600">
              Fill out the form below to submit your application
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label={form?.FirstNameLabel} required>
                <input
                  className="h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary"
                  placeholder={form?.FirstNamePlaceholder}
                  value={data.firstName}
                  onChange={(e) => applyFieldChange('firstName', e.target.value)}
                  required
                />
              </InputField>

              <InputField label={form?.LastNameLabel} required>
                <input
                  className="h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary"
                  placeholder={form?.LastNamePlaceholder}
                  value={data.lastName}
                  onChange={(e) => applyFieldChange('lastName', e.target.value)}
                  required
                />
              </InputField>

              <InputField label={form?.PhoneNumberLabel} required>
                <input
                  className="h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary"
                  placeholder={form?.PhoneNumberPlaceholder}
                  value={data.phone}
                  onChange={(e) => applyFieldChange('phone', e.target.value)}
                  required
                  inputMode="tel"
                />
              </InputField>

              <InputField label={form?.EmailLabel} required>
                <input
                  className="h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary"
                  placeholder={form?.EmailPlaceholder}
                  type="email"
                  value={data.email}
                  onChange={(e) => applyFieldChange('email', e.target.value)}
                  required
                />
              </InputField>

              <InputField label={form?.CityLabel} required className="col-span-2">
                <div className="relative">
                  <select
                    className="h-12 w-full appearance-none rounded-2xl border px-4 pr-10 outline-none focus:border-primary"
                    value={data.city}
                    onChange={(e) => applyFieldChange('city', e.target.value)}
                    required
                  >
                    <option value="" hidden>
                      {form?.CityPlaceholder}
                    </option>
                    {cityChoices.map((city, idx) => {
                      const val = city.Value ?? '';
                      const key = city.Key ?? (val || `city-${idx}`);
                      return (
                        <option key={key} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ▾
                  </span>
                </div>
              </InputField>

              <div className="col-span-full">
                <InputField label={form?.CoverLetterLabel}>
                  <textarea
                    className="min-h-[120px] w-full rounded-2xl border-2 border-dashed border-[#7B80FF] p-4 outline-none focus:border-[#5F66FF]"
                    placeholder={form?.CoverLetterPlaceholder}
                    value={data.coverLetter}
                    onChange={(e) => applyFieldChange('coverLetter', e.target.value)}
                  />
                </InputField>
              </div>

              <div className="col-span-2">
                {form?.ResumeInstructions && (
                  <div className="mb-2 text-sm text-gray-600 text-center">
                    {form?.ResumeInstructions}
                  </div>
                )}

                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleResume(e.dataTransfer.files?.[0]);
                  }}
                  className="flex flex-col items-center gap-3 cursor-pointer rounded-2xl border-2 border-dashed border-[#7B80FF] bg-[#F7FAFF] p-6 text-center"
                >
                  <Image src="/icons/upload_icon.png" alt="upload photo" width={24} height={24} />

                  <div className="flex flex-col items-center justify-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        handleResume(e.target.files?.[0] ?? null);
                      }}
                    />

                    <div className="font-medium text-[#212121]">{form?.ResumeSectionTitle}</div>
                    <div className="text-xs text-[#424242]">{form?.ResumeFileNote}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-14px font-medium py-6 text-primary"
                  >
                    Browse Files
                  </button>

                  {data.resume && !error && (
                    <div className="text-sm text-gray-700">Selected: {data.resume.name}</div>
                  )}
                  {error && <div className="text-sm text-red-600">{error}</div>}
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              {serverError && <span className="text-sm text-red-600">{serverError}</span>}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </section>
    </SpinnerLoader>
  );
}

