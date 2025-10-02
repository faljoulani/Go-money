'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSfMutation } from '../../../../utils/hooks/useSfMutation';
import InputField from '../../../atoms/inputField/inputField';
import SpinnerLoader from '../../../atoms/spinnerLoader/spinnerLoader';
import CustomDropdown, { DropdownOption } from '../../../atoms/dropdown/dropdown';
import ApplicationSuccess from './applicationSuccess';

type CareerDetails = {
  Title?: string;
  DepartmentName?: string;
  LocationName?: string;
  EmploymentType?: string;
  Sections?: { OverviewHtml?: string };
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

const citiesFrom = (form?: any, overrideCities?: any[]): CityItem[] => {
  const a: CityItem[] = Array.isArray(form?.CityChoices) ? form.CityChoices : [];
  const b: CityItem[] = Array.isArray(overrideCities) ? overrideCities : [];
  const src = a.length ? a : b;
  return src.map((c: any) => ({ Key: c?.Key ?? c?.key, Value: c?.Value ?? c?.value }));
};

export default function ApplyForJob({
  className,
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
  const cityChoices = citiesFrom(form, cities);

  const applyFieldChange = <K extends keyof FormDataState>(key: K, value: FormDataState[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const cityOptions: DropdownOption[] = cityChoices.map((c, i) => {
    const label = c.Value ?? '';
    return { id: label || `city-${i}`, label, value: label };
  });

  const handleResume = (file?: File | null) => {
    if (!file) return;
    const err = !allowedTypes.includes(file.type)
      ? 'Supported formats: PDF, JPG, PNG.'
      : file.size > maxBytes
        ? 'Maximum file size is 2MB.'
        : null;
    setError(err);
    if (!err) applyFieldChange('resume', file);
  };

  useEffect(() => {
    setJobError(null);
    setJobDetails(null);
    if (!jobId) return;
    let cancelled = false;
    (async () => {
      try {
        const response: any = await fetchJobDetails({ id: jobId, language });
        if (cancelled) return;
        if (!response?.Success || !response?.Data) {
          setJobError(response?.Error || 'Failed to load job details.');
          return;
        }
        setJobDetails(response.Data as CareerDetails);
      } catch (e) {
        if (!cancelled) setJobError('Failed to load job details. Please try again.');
      }
    })();
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

  const normalizedLanguage = (language || '').toLowerCase();
  const isRtl = form?.Direction === 'rtl' || normalizedLanguage.startsWith('ar');

  const phoneCode = form?.PhoneCountryCode || '+966';

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
    } catch {
      setServerError('Something went wrong while submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SpinnerLoader show={loading} message="Loading job details...">
      {/* PAGE WRAP — mobile first */}
      <section className={`mx-auto w-full max-w-[760px] py-10 md:px-6 md:py-10 ${className ?? ''}`}>
        {jobError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {jobError}
          </div>
        )}

        {/* JOB HEADER CARD */}
        {jobDetails && (
          <div className="w-full rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-sm md:p-6">
            <h1 className="text-2xl font-bold leading-[100%] md:text-primary">{title}</h1>

            {(department || location || employmentType) && (
              <div className="mt-3 flex flex-col justify-start md:flex-wrap md:items-center gap-4 text-sm text-neutral-600">
                {department && (
                  <div className="flex items-center gap-2">
                    <Image src="/icons/industry_icon.png" alt="industry" width={20} height={20} />
                    <span className="font-medium">{department}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <Image src="/icons/map-pin.png" alt="Location" width={20} height={20} />
                    <span>{location}</span>
                  </div>
                )}
                {employmentType && (
                  <div className="flex items-center gap-2">
                    <Image
                      src="/icons/o'clock_job_icon.png"
                      alt="Employment Type"
                      width={20}
                      height={20}
                    />
                    <span>{employmentType}</span>
                  </div>
                )}
              </div>
            )}

            {overviewHtml && (
              <div className="mt-5">
                <div
                  className="prose max-w-none text-[14px] leading-6 text-neutral-700 md:text-base"
                  dangerouslySetInnerHTML={{ __html: overviewHtml }}
                />
              </div>
            )}
          </div>
        )}

        {/* FORM CARD */}
        {submitted ? (
          <section aria-live="polite" className="mt-6">
            <ApplicationSuccess />
          </section>
        ) : (
          <form
            noValidate
            onSubmit={onSubmit}
            className="mt-6 rounded-2xl border bg-white p-5 shadow-sm md:p-7"
          >
            {/* Title + subtitle like Figma */}
            <h2 className="text-2xl font-bold leading-tight md:text-primary">
              {form?.Title ?? 'Application form'}
            </h2>
            <p className="mt-2 mb-5 text-sm leading-6 text-gray-600">
              {form?.SubTitle ?? 'Fill out the form below to submit your application'}
            </p>

            {/* Fields — single column on mobile */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField label={form?.FirstNameLabel} required>
                <input
                  className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-14px outline-none transition focus:border-primary"
                  placeholder={form?.FirstNamePlaceholder}
                  value={data.firstName}
                  onChange={(e) => applyFieldChange('firstName', e.target.value)}
                  required
                />
              </InputField>

              <InputField label={form?.LastNameLabel} required>
                <input
                  className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-14px outline-none transition focus:border-primary"
                  placeholder={form?.LastNamePlaceholder}
                  value={data.lastName}
                  onChange={(e) => applyFieldChange('lastName', e.target.value)}
                  required
                />
              </InputField>

              {/* Phone with prefix chip like Figma */}
              <InputField label={form?.PhoneNumberLabel} required>
                <div className="flex h-12 w-full items-center gap-3">
                  <div className="flex h-full min-w-[88px] items-center justify-center rounded-2xl border border-gray-200 bg-white text-14px font-semibold text-gray-800">
                    {phoneCode}
                  </div>
                  <input
                    className="h-full w-full flex-1 rounded-2xl border border-gray-200 px-4 text-14px outline-none transition focus:border-primary"
                    placeholder={form?.PhoneNumberPlaceholder}
                    value={data.phone}
                    onChange={(e) => applyFieldChange('phone', e.target.value)}
                    required
                    inputMode="tel"
                  />
                </div>
              </InputField>

              <InputField label={form?.EmailLabel} required>
                <input
                  className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-14px outline-none transition focus:border-primary"
                  placeholder={form?.EmailPlaceholder}
                  type="email"
                  value={data.email}
                  onChange={(e) => applyFieldChange('email', e.target.value)}
                  required
                />
              </InputField>

              {/* City full width on mobile (matches screenshot) */}
              <InputField label={form?.CityLabel} required className="md:col-span-2">
                <CustomDropdown
                  name="City"
                  dir={isRtl ? 'rtl' : 'ltr'}
                  options={cityOptions}
                  placeholder={form?.CityPlaceholder ?? 'Select your city'}
                  valueId={data.city || null}
                  onChange={(opt) => applyFieldChange('city', opt.value ?? opt.id)}
                  className="relative w-full"
                  buttonClassName={[
                    'group flex h-12 w-full items-center justify-between overflow-hidden rounded-2xl',
                    'border border-gray-200 bg-white text-14px text-gray-800',
                    'transition-colors duration-150 hover:border-gray-300 hover:bg-gray-100',
                    'focus:ring-2 focus:ring-primary/20 px-4',
                    isRtl ? 'text-right' : 'text-left',
                  ].join(' ')}
                  listClassName="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-auto rounded-2xl bg-white p-2 shadow-xl"
                  optionClassName="mt-1 w-full rounded-xl p-2 text-left text-sm text-gray-800 hover:bg-gray-100 rtl:text-right"
                />
              </InputField>

              <div className="md:col-span-2">
                <InputField label={form?.CoverLetterLabel}>
                  <textarea
                    className="min-h-[120px] w-full rounded-2xl border-2 border-gray-200 p-4 text-14px outline-none transition focus:border-[#5F66FF]"
                    placeholder={form?.CoverLetterPlaceholder}
                    value={data.coverLetter}
                    onChange={(e) => applyFieldChange('coverLetter', e.target.value)}
                  />
                </InputField>
              </div>

              {/* Resume uploader */}
              <div className="col-span-1 md:col-span-2 py-6">
                {form?.ResumeInstructions && (
                  <div className="mb-2 text-center text-sm text-gray-600">
                    {form?.ResumeInstructions}
                  </div>
                )}

                {/* Upload box */}
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
                  className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#7B80FF] bg-[#F7FAFF] p-5 text-center md:p-6"
                >
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center">
                    <Image src="/icons/upload_icon.png" alt="upload" width={24} height={24} />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => handleResume(e.target.files?.[0] ?? null)}
                  />

                  <div className="text-sm font-semibold text-[#212121]">
                    {form?.ResumeSectionTitle ?? 'Drag and drop files here to upload'}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-[#424242]">
                    {form?.ResumeFileNote ??
                      'Maximum file size allowed is 2MB, supported file formats include .jpg, .png, and .pdf.'}
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-semibold text-primary underline decoration-transparent hover:decoration-primary"
                    >
                      {form?.CtaText || 'Browse Files'}
                    </button>
                  </div>
                </label>

                {/* File info + error */}
                {data.resume && !error && (
                  <div className="mt-2 text-sm text-gray-700 text-center">
                    Selected: {data.resume.name}
                  </div>
                )}
                {error && <div className="mt-2 text-sm text-red-600 text-center">{error}</div>}
              </div>
            </div>

            {/* Submit row — full-width pill on mobile like Figma */}
            <div className="mt-6">
              {serverError && (
                <div className="mb-3 text-center text-sm text-red-600">{serverError}</div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#010663] text-base font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60 md:w-auto md:px-6 md:rounded-2xl"
              >
                {isRtl ? 'إرسال الطلب' : submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </section>
    </SpinnerLoader>
  );
}

