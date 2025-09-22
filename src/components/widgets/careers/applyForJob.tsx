'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import InputField from '../../atoms/inputField/inputField';

type Props = {
  dir?: 'rtl' | 'ltr' | 'auto';
  className?: string;
};

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

function ApplicationSuccess({ backHref = '/careers' }: { backHref?: string }) {
  return (
    <div className="rounded-3xl border bg-white px-16 py-16 text-center">
      <div className="mx-auto flex items-center justify-center">
        {/* colored checkmark using PNG as a mask */}
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
        Back to career
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

export default function ApplyForJob({ dir = 'ltr', className }: Props) {
  const [data, setData] = useState<FormDataState>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    coverLetter: '',
    resume: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function onChange<K extends keyof FormDataState>(key: K, val: FormDataState[K]) {
    setData((s) => ({ ...s, [key]: val }));
  }

  function validateFile(file: File) {
    if (!allowedTypes.includes(file.type)) {
      return 'Supported formats: PDF, JPG, PNG.';
    }
    if (file.size > maxBytes) {
      return 'Maximum file size is 2MB.';
    }
    return null;
  }

  function onFilePicked(file?: File) {
    if (!file) return;
    const err = validateFile(file);
    setError(err);
    if (!err) onChange('resume', file);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) onFilePicked(file);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const ok = form.checkValidity() && !error;
    if (!ok) {
      form.reportValidity();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section dir={dir} className="w-full space-y-6 mx-20">
        <ApplicationSuccess backHref="/careers" />
      </section>
    );
  }
  return (
    <section dir={dir} className="w-full space-y-6 mx-20">
      {/* Job summary box */}
      <div className="rounded-2xl border bg-white p-6 md:p-7">
        <h1 className="text-[22px] md:text-2xl font-bold text-primary">UX/UI Designer</h1>

        <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-[#101828]">
          <div className="flex items-center gap-2">
            <Image src="/icons/building_without_color.png" alt="" width={24} height={24} />
            <span>Design Department</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/icons/map-pin.png" alt="" width={24} height={24} />
            <span>Riyadh, Saudi Arabia</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/icons/clock-hour-3.png" alt="" width={24} height={24} />
            <span>Full-time</span>
          </div>
        </div>

        <p className="mt-4 text-[#424242]">
          We are seeking a talented UX/UI Designer to join our dynamic design team at Go Money. You
          will be responsible for creating intuitive and engaging user experiences for our financial
          technology platform, working closely with product managers and developers to bring
          innovative solutions to life.
        </p>
        <p className="mt-3 text-[#424242]">
          The ideal candidate will have a strong portfolio demonstrating expertise in user research,
          wireframing, prototyping, and visual design. You should be passionate about fintech and
          have experience designing for mobile and web applications.
        </p>
      </div>

      {/* Apply box */}
      <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-7">
        <h2 className="text-xl font-bold text-primary">Apply for vacancy</h2>
        <p className="mt-2 mb-6 text-sm text-gray-600">
          Fill out the form below to submit your application
        </p>

        {/* Grid fields */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="First Name" required>
            <input
              className="h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary"
              placeholder="Enter Your First Name"
              value={data.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              required
            />
          </InputField>

          <InputField label="Last Name" required>
            <input
              className="h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary"
              placeholder="Enter Your Last Name"
              value={data.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              required
            />
          </InputField>

          <InputField label="Phone Number" required>
            <div className="flex h-12 items-center rounded-2xl border focus-within:border-primary">
              <span className="flex items-center gap-2 border-r px-3 text-sm text-gray-700">
                <Image src="/icons/sa-flag.png" alt="" width={18} height={12} />
                +966
              </span>
              <input
                className="h-full w-full rounded-2xl px-3 outline-none"
                placeholder="00 000 0000"
                value={data.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                required
                inputMode="tel"
              />
            </div>
          </InputField>

          <InputField label="Email" required>
            <input
              className="h-12 w-full rounded-2xl border px-4 outline-none focus:border-primary"
              placeholder="Example@email.com"
              type="email"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              required
            />
          </InputField>

          <InputField label="City" required className="col-span-2">
            <div className="relative">
              <select
                className="h-12 w-full appearance-none rounded-2xl border px-4 pr-10 outline-none focus:border-primary"
                value={data.city}
                onChange={(e) => onChange('city', e.target.value)}
                required
              >
                <option value="" hidden>
                  Select your city
                </option>
                <option>Riyadh</option>
                <option>Jeddah</option>
                <option>Dammam</option>
                <option>Mecca</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                ▾
              </span>
            </div>
          </InputField>

          {/* Cover Letter */}
          <div className="col-span-full md:col-span-2">
            <InputField label="Cover Letter">
              <textarea
                className="min-h-[120px] w-full rounded-2xl border-2 border-dashed border-[#7B80FF] p-4 outline-none focus:border-[#5F66FF]"
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                value={data.coverLetter}
                onChange={(e) => onChange('coverLetter', e.target.value)}
              />
            </InputField>
          </div>

          {/* Resume Uploader */}
          <div className="md:col-span-2">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleDrop}
              className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#7B80FF] bg-[#F7FAFF] p-6 text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => onFilePicked(e.target.files?.[0])}
              />
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
                <Image src="/icons/upload_icon.png" alt="" width={24} height={24} />
              </div>
              <div className="font-medium text-[#212121]">Drag and drop files here to upload</div>
              <div className="mt-3 text-xs text-[#424242]">
                Maximum file size allowed is 2MB, supported file formats include .jpg, .png, and
                .pdf.
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-14px font-medium py-6 text-primary"
              >
                Browse Files
              </button>

              {data.resume && !error && (
                <div className="mt-3 text-sm text-gray-700">Selected: {data.resume.name}</div>
              )}
              {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-2xl bg-[#010663] px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            Submit Application
          </button>
        </div>
      </form>
    </section>
  );
}

