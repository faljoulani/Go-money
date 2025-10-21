'use client';

import * as React from 'react';
import Description from '../../atoms/description/description';
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
  console.log('MSG', msg);

  return (
    <section className="w-full" dir={dir}>
      <div className="mx-auto max-w-[1240px] rounded-3xl bg-surface-section mt-16 p-8 text-center">
        <div className="mx-auto mb-6 grid place-items-center">
          <img
            src={msg.imageUrl ?? '/assets/success.png'}
            alt={msg.imageAlt || 'Success'}
            className="h-24 w-24 object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>

        {msg.title && (
          <h2 className="xs:text-[28px] md:text-[44px] font-semibold text-primary mb-3">
            {msg.title}
          </h2>
        )}

        {msg.description && (
          <p className="text-[16px] md:text-[18px] text-default max-w-3xl mx-auto">
            {msg.description}
          </p>
        )}

        {(msg.noteTitle || msg.noteDescription) && (
          <div className="mt-8 rounded-2xl border border-[#B9D7F2] dark:border-none dark:bg-[#23242C] bg-blue-100 p-4 text-[14px] max-w-4xl mx-auto">
            <div className="flex flex-col items-start gap-2">
              {msg.noteTitle && (
                <div className="flex gap-2">
                  <InfoIcon />
                  <strong className="text-[#0045AB] dark:text-primaryAlt">{msg.noteTitle}</strong>
                </div>
              )}
              {msg.noteDescription && (
                <p className="mt-1 ml-6 text-default">{msg.noteDescription}</p>
              )}
            </div>
          </div>
        )}

        {(msg.backLabel || msg.primaryLabel || msg.downloadLabel) && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {msg.backLabel && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border-2 border-primaryAlt text-primaryAlt font-semibold px-6 py-3 text-[15px] hover:opacity-90"
              >
                {msg.backLabel}
              </button>
            )}

            {msg.primaryLabel && msg.primaryUrl && (
              <a
                href={msg.primaryUrl}
                className="rounded-full bg-primaryAlt text-secondary font-bold px-6 py-3 text-[15px] hover:opacity-90"
              >
                {msg.primaryLabel}
              </a>
            )}

            {msg.downloadLabel && msg.downloadUrl && (
              <a
                href={msg.downloadUrl}
                className="rounded-full bg-primaryAlt text-secondary font-bold px-6 py-3 text-[15px] hover:opacity-90"
              >
                {msg.downloadLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- FAIL (dynamic-only) ---------------- */

export function FailResponse({
  msg,
  dir = 'ltr',
  onBack,
}: {
  msg: ResponseMessage;
  dir?: Dir;
  onBack: () => void;
}) {
  return (
    <section className="w-full" dir={dir}>
      <div className="mx-auto max-w-[1240px] rounded-3xl bg-surface-section mt-16 p-8 text-center">
        <div className="mx-auto mb-6 grid place-items-center">
          <img
            src={msg.imageUrl ?? '/assets/failed.png'}
            alt={msg.imageAlt || 'Failed'}
            className="h-24 w-24 object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>

        {msg.title && (
          <h2 className="text-[32px] md:text-[40px] font-semibold text-primary mb-2">
            {msg.title}
          </h2>
        )}

        {msg.description && (
          <p className="text-[16px] md:text-[18px] text-default max-w-3xl mx-auto descriptionHtml">
            <Description html={msg.description}></Description>
          </p>
        )}

        {(msg.reasonsTitle || msg.reasonsDescription) && (
          <div
            className={`mx-auto mt-8 md:w-[80%] grid grid-cols-1 gap-4 ${
              dir === 'ltr' ? 'text-left' : 'text-right'
            }`}
          >
            <div className="rounded-xl dark:bg-[#23242C] bg-gray-100 p-5">
              {msg.reasonsTitle && (
                <strong className="block mb-3 text-default xs:text-[20px] md:text-[16px]">
                  {msg.reasonsTitle}
                </strong>
              )}
              {msg.reasonsDescription && (
                <p
                  className="leading-6 descriptionHtml"
                  dangerouslySetInnerHTML={{ __html: msg.reasonsDescription }}
                />
              )}
            </div>
          </div>
        )}

        {(msg.actionsTitle || msg.actionsDescription) && (
          <div
            className={`mx-auto mt-8 md:w-[80%] grid grid-cols-1 gap-4 ${
              dir === 'ltr' ? 'text-left' : 'text-right'
            }`}
          >
            <div className="rounded-xl dark:bg-[#23242C] bg-gray-100 p-5">
              {msg.actionsTitle && (
                <strong className="block text-default xs:text-[20px] md:text-[16px]">
                  {msg.actionsTitle}
                </strong>
              )}
              {msg.actionsDescription && (
                <p
                  className="leading-6 descriptionHtml"
                  dangerouslySetInnerHTML={{ __html: msg.actionsDescription }}
                />
              )}
            </div>
          </div>
        )}

        {msg.validationText && <p className="mt-8 text-default">{msg.validationText}</p>}

        {msg.backLabel && (
          <div className="mt-8">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border-[3px] dark:border-primaryAlt border-[#010663] font-semibold text-primaryAlt px-6 py-3 text-[15px] hover:bg-gray-50"
            >
              {msg.backLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* --- Shared icon --- */
function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="var(--color-primary-alt)" />
      <circle cx="12" cy="7" r="1.3" fill="var(--color-secondary)" />
      <rect x="10.9" y="10.2" width="2.2" height="8.5" rx="1.1" fill="var(--color-secondary)" />
    </svg>
  );
}

