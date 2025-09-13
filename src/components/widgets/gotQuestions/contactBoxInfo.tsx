import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { ContactBoxEntity } from './contactBox.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { parseMaybeJson } from '../../../utils/utils';
import React from 'react';
import ContactBoxInfo from './contactBoxInfo';

type ContactBoxItem = {
  Id: string;
  Title?: string;
  SubTitle?: string;

  // Labels
  EmailLabel?: string;
  CallUsLabel?: string;

  // Values to show inside the cards
  EmailText?: string;
  CallUsText?: string;

  // (kept for compatibility, but not used in this visual)
  FaqsLabel?: string;
  ButtonLabel?: string;
  CTAURL?: any;
  FaqsURL?: any;

  hasLabelCorner?: boolean;
};

const linkHref = (lnk: any): string =>
  typeof lnk === 'string' ? lnk : lnk?.Href || lnk?.Url || lnk?.url || lnk?.Attributes?.href || '';

const asTel = (raw?: string) => (raw ? `tel:${raw.replace(/[^\d+]/g, '')}` : undefined);

const asMailto = (raw?: string) => (raw ? `mailto:${raw.trim()}` : undefined);

export default async function ContactBox(props: WidgetContext<ContactBoxEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';

  const { culture, isEdit } = props.requestContext;

  // Read selection from designer
  const properties = (props.model?.Properties || {}) as any;
  const sel = parseMaybeJson(properties?.ContactBox) ?? properties?.ContactBox;
  const selectedId = extractSelectionId(sel);

  if (!selectedId) {
    return isEdit ? (
      <section
        {...attrs}
        className="relative mx-auto w-full max-w-[1240px] rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-black/5"
      >
        <div className="w-full rounded-2xl border border-dashed p-6 text-slate-600">
          <strong>Got Questions</strong>
          <div className="mt-1">Open the designer and select a Contact Box item.</div>
        </div>
      </section>
    ) : null;
  }

  const item = (await fetchData(
    [selectedId],
    null,
    culture,
    [
      'Id',
      'Title',
      'SubTitle',
      'EmailLabel',
      'CallUsLabel',
      'EmailText',
      'CallUsText',
      'FaqsLabel',
      'ButtonLabel',
      'CTAURL',
      'FaqsURL',
      'hasLabelCorner',
    ],
    {
      itemType:
        sel?.Content?.[0]?.Type || 'Telerik.Sitefinity.DynamicTypes.Model.ContactBox.ContactBox',
      single: true,
    },
  )) as ContactBoxItem | null;

  const title = item?.Title || 'Still have questions?';
  const subtitle = item?.SubTitle || 'our dedicated Support team is Here to Help';

  const callLabel = item?.CallUsLabel || 'Call Us';
  const emailLabel = item?.EmailLabel || 'Email';

  const phoneText = item?.CallUsText || '';
  const emailText = item?.EmailText || '';

  const phoneHref = asTel(phoneText);
  const emailHref = asMailto(emailText);

  const showCorner =
    typeof item?.hasLabelCorner === 'boolean'
      ? item!.hasLabelCorner
      : String(item?.hasLabelCorner || '').toLowerCase() === 'true';

  const CardWrap: React.FC<React.PropsWithChildren<{ href?: string }>> = ({ href, children }) =>
    href ? (
      <a
        href={href}
        className="block rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md"
      >
        {children}
      </a>
    ) : (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {children}
      </div>
    );

  return (
    <section
      {...attrs}
      className="relative mx-auto w-full max-w-[1240px] overflow-hidden rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5 mb-10"
    >
      {showCorner && (
        <div className="absolute right-0 top-0">
          <div className="h-24 w-24 rounded-bl-[40px] bg-[#0A43FF]" />
          <div className="absolute right-0 top-0 h-12 w-12 bg-white" />
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <h2 className="text-[48px] font-extrabold leading-tight tracking-[-0.02em] text-[#01115A]">
          {title}
        </h2>
        {subtitle && <p className="mt-4 text-lg leading-relaxed text-[#0a1b2e]/60">{subtitle}</p>}
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        <CardWrap href={phoneHref}>
          <div className="flex items-center justify-center gap-2 text-[#01115A]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.63 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.2a2 2 0 0 1 2.11-.45c.8.3 1.64.51 2.5.63A2 2 0 0 1 22 16.92Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base font-semibold">{callLabel}</span>
          </div>

          <div className="mx-auto my-5 h-px w-3/4 bg-slate-200" />

          <div className="text-lg text-[#0a1b2e]/90">{phoneText || '-'}</div>
        </CardWrap>

        <CardWrap href={emailHref}>
          <div className="flex items-center justify-center gap-2 text-[#01115A] font-light">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 0l8 7 8-7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base font-semibold">{emailLabel}</span>
          </div>

          <div className="mx-auto my-5 h-px w-3/4 bg-slate-200" />

          <div className="text-lg text-[#0a1b2e]/90 break-all font-light">{emailText || '-'}</div>
        </CardWrap>
      </div>
    </section>
  );
}

