import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { ContactBoxEntity } from './contactBox.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { resolveSitefinitySelection } from '../../../utils/utils';
import React from 'react';
import ContactBoxInfo from './contactBoxInfo';

type ContactBoxItem = {
  Id: string;
  Title?: string;
  SubTitle?: string;
  EmailLabel?: string;
  CallUsLabel?: string;
  FaqsLabel?: string;
  ButtonLabel?: string;
  CTAURL?: any;
  FaqsURL?: any;
  hasLabelCorner?: boolean;
};

const linkHref = (lnk: any): string =>
  typeof lnk === 'string' ? lnk : lnk?.Href || lnk?.Url || lnk?.url || lnk?.Attributes?.href || '';

export default async function ContactBox(props: WidgetContext<ContactBoxEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';
  const { culture, isEdit } = props.requestContext;

  const properties = (props.model?.Properties || {}) as any;
  const sel = resolveSitefinitySelection(properties?.ContactBox) ?? properties?.ContactBox;
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

  // Fetch the selected Contact Box
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
      'FaqsLabel',
      'ButtonLabel',
      'CTAURL',
      'FaqsURL',
      'hasLabelCorner',
    ],
    {
      // trust the selection’s type so we don’t hardcode the dynamic module path
      itemType:
        sel?.Content?.[0]?.Type || 'Telerik.Sitefinity.DynamicTypes.Model.ContactBox.ContactBox',
      single: true,
    },
  )) as ContactBoxItem | null;

  const title = item?.Title || 'Got Questions?';
  const subtitle = item?.SubTitle || 'Our dedicated Support team is here to help';

  const primaryLabel = item?.EmailLabel || item?.CallUsLabel || item?.ButtonLabel || 'Contact Us';
  const primaryHref = linkHref(item?.CTAURL) || '#';

  // Secondary CTA: FAQs
  const secondaryLabel = item?.FaqsLabel || 'FAQs';
  const secondaryHref = linkHref(item?.FaqsURL) || '#';

  const showCorner =
    typeof item?.hasLabelCorner === 'boolean'
      ? item!.hasLabelCorner
      : String(item?.hasLabelCorner || '').toLowerCase() === 'true';
  console.log('SELECTED VIEWWWWW', selectedView);
  if (selectedView === 'EmailAndPhone') {
    return <ContactBoxInfo {...props} />;
  }
  return (
    <section
      {...attrs}
      className="relative w-full max-w-[1240px] overflow-hidden rounded-[28px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5 mx-20 my-16"
    >
      {showCorner && (
        <div className="absolute right-0 top-0">
          <div className="h-24 w-24 rounded-bl-[40px] bg-[#0A43FF]" />

          <div className="absolute right-0 top-0 h-12 w-12 bg-white" />
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <h2 className="text-[40px] font-extrabold leading-tight tracking-[-0.02em] text-[#01115A]">
          {title}
        </h2>

        {subtitle && <p className="mt-3 text-base leading-relaxed text-[#0a1b2e]/70">{subtitle}</p>}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#01115A] px-6 py-3 text-[#01115A] transition hover:bg-[#01115A] hover:text-white"
          >
            <span>{primaryLabel}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <a
            href={secondaryHref}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#01115A] px-6 py-3 font-light transition hover:bg-[#01115A] hover:text-white"
          >
            <span>{secondaryLabel}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

