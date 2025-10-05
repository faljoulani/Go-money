'use client';

import * as React from 'react';
export type ResponseMessage = {
  id?: string;

  title: string;
  description: string;

  noteTitle: string;
  noteDescription: string;

  primaryLabel: string;
  primaryUrl?: string;

  downloadLabel: string;
  downloadUrl?: string;

  backLabel: string;
  backUrl?: string;

  validationText: string;

  imageUrl?: string;
  imageAlt: string;

  // Fail-screen only
  reasonsTitle: string;
  reasonsDescription: string;
  actionsTitle: string;
  actionsDescription: string;
};

type Dir = 'rtl' | 'ltr';

export function SuccessResponse({
  msg,
  dir = 'ltr',
  onBack,
}: {
  msg: ResponseMessage;
  dir?: Dir;
  onBack: () => void;
}) {
  const {
    title,
    description,
    noteTitle,
    noteDescription,
    backLabel,
    downloadLabel,
    downloadUrl,
    primaryLabel,
    primaryUrl,
    imageUrl,
    imageAlt,
  } = msg;

  const iconUrl = imageUrl || '/assets/success.png';
  const primaryHref = primaryUrl || '#';

  return (
    <section className="w-full" dir={dir}>
      <div className="mx-auto max-w-[1240px] rounded-3xl bg-white mt-16 p-8 text-center">
        <div className="mx-auto mb-6 grid place-items-center">
          <img src={iconUrl} alt={imageAlt || 'success'} className="h-24 w-24 object-contain" />
        </div>

        <h2 className="xs:text-[28px] md:text-[44px] font-semibold text-[#0B2A8E] mb-3">{title}</h2>
        <p
          className="text-[16px] md:text-[18px] text-[#333] max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <div className="mt-8 rounded-2xl border border-[#B9D7F2] bg-[#E9F5FF] p-4 text-[13px] text-[#0B4F84] max-w-4xl mx-auto">
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-2">
              <InfoIcon />
              <strong>{noteTitle}</strong>
            </div>
            <div>
              <p className="mt-1 ml-6" dangerouslySetInnerHTML={{ __html: noteDescription }}></p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-[#0B2A8E] text-[#0B2A8E] px-6 py-3 text-[15px] hover:bg-[#0B2A8E]/5"
          >
            {backLabel}
          </button>
          <a
            href={downloadUrl}
            className="rounded-full bg-[#0B2A8E] text-white px-6 py-3 text-[15px] hover:opacity-90"
          >
            {downloadLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

export function FailResponse({
  msg,
  dir = 'ltr',
  onBack,
}: {
  msg: ResponseMessage;
  dir?: Dir;
  onBack: () => void;
}) {
  const {
    title,
    description,
    reasonsTitle,
    reasonsDescription,
    actionsTitle,
    actionsDescription,
    validationText,
    backLabel,
    imageUrl,
    imageAlt,
  } = msg;

  const iconUrl = imageUrl || '/assets/failed.png';
  const splitLines = (v?: string) =>
    (v || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  console.log('ZZZZZ', reasonsDescription);
  const reasons = splitLines(reasonsDescription);
  const actions = splitLines(actionsDescription);

  return (
    <section className="w-full" dir={dir}>
      <div className="mx-auto max-w-[1240px] rounded-3xl bg-white mt-16 p-8 text-center">
        <div className="mx-auto mb-6 grid place-items-center">
          <img
            src={iconUrl}
            alt={imageAlt || 'not-eligible'}
            className="h-24 w-24 object-contain"
          />
        </div>

        <h2 className="text-[32px] md:text-[40px] font-semibold text-[#0B2A8E] mb-2">{title}</h2>
        <p
          className="text-[16px] md:text-[18px] text-[#333] max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <div className="mt-8 grid  grid-cols-1 gap-4">
          <div className="rounded-xl bg-[#F4F6FA] p-5">
            <strong className="block mb-3 text-[#0B2A8E]">{reasonsTitle}</strong>

            <p className="leading-4" dangerouslySetInnerHTML={{ __html: reasonsDescription }}></p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="rounded-xl bg-[#F4F6FA] p-5">
            <strong className="block text-[#0B2A8E]">{actionsTitle}</strong>

            <p className="leading-4" dangerouslySetInnerHTML={{ __html: actionsDescription }}></p>
          </div>
        </div>

        <p className="mt-8 text-[#555]">{validationText}</p>

        <div className="mt-8">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-[#0B2A8E] text-[#0B2A8E] px-6 py-3 text-[15px] hover:bg-[#0B2A8E]/5"
          >
            {backLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="12" fill="#0052CC" />
      <rect x="11" y="10" width="2" height="6" fill="white" />
      <circle cx="12" cy="7" r="1.2" fill="white" />
    </svg>
  );
}

