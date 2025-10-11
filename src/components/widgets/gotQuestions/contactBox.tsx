import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { ContactBoxEntity } from './contactBox.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { linkToHref, resolveSitefinitySelection } from '../../../utils/utils';
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
        className="relative mx-auto w-full max-w-[1240px] rounded-3xl 
        bg-white px-6 py-16 text-center ring-1 ring-black/5"
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
  let primaryHref = item?.CTAURL;

  try {
    if (typeof primaryHref === 'string') {
      primaryHref = JSON.parse(primaryHref);
    }
  } catch {
    // If parsing fails, leave it as-is
  }
  const ctaHref = linkToHref(primaryHref);
  // Secondary CTA: FAQs
  const secondaryLabel = item?.FaqsLabel || 'FAQs';
  let secondaryHref = item?.FaqsURL;

  try {
    if (typeof secondaryHref === 'string') {
      secondaryHref = JSON.parse(secondaryHref);
    }
  } catch {
    // If parsing fails, leave it as-is
  }
  const faqurl = linkToHref(secondaryHref);

  const showCorner =
    typeof item?.hasLabelCorner === 'boolean'
      ? item!.hasLabelCorner
      : String(item?.hasLabelCorner || '').toLowerCase() === 'true';
  if (selectedView === 'EmailAndPhone') {
    return <ContactBoxInfo {...props} />;
  }
  return (
    <section
      {...attrs}
      className="relative w-full md:mx-auto max-w-[1240px] overflow-hidden md:rounded-[24px] xs:rounded-[16px]
      bg-surface-section xs:px-8 xs:py-12 md:px-6 md:py-16 text-center md:mt-16 xs:mt-10 mb-8"
    >
      <div className="absolute md:right-0 md:top-0 xs:-right-3 xs:top-0 rtl:left-0 rtl:right-auto">
        <div
          className="md:h-24 md:w-24 xs:w-[68px] xs:h-[68px] md:rounded-bl-[40px] xs:rounded-bl-[25px] 
        bg-primaryAlt rtl:rounded-br-[40px] rtl:rounded-bl-none xs:rtl:rounded-br-[25px] xs:rtl:rounded-bl-none"
        />

        <div
          className="absolute right-0 top-0 rtl:left-0 rtl:right-auto md:h-12 md:w-12 xs:h-10 xs:w-10
         bg-white dark:bg-[#1d1d29]"
        />
      </div>

      <div className="mx-auto max-w-2xl">
        <h2 className="md:text-[3rem] xs:text-2xl font-bold leading-tight tracking-[-0.02em] text-primary">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-3 text-base leading-relaxed text-[#9E9E9E] font-medium">{subtitle}</p>
        )}

        <div className="mt-12 flex flex-wrap xs:flex-col md:flex-row items-center justify-center gap-4 ">
          <a
            href={ctaHref}
            className="group transition-colors inline-flex md:w-[189px] xs:w-[90%] 
            md:rtl:w-[168px] text-lg tracking-tight items-center justify-center gap-2 
            rounded-[20px] border-2 border-primaryAlt px-6 py-3 text-primaryAlt font-medium 
            hover:bg-primary hover:text-white hover:dark:bg-[#A6EFD9] hover:dark:text-[#010663]"
          >
            <div className=" group-hover:text-white group-hover:dark:text-[#010663]">
              {primaryLabel}
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="cta-arrow "
            >
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
            href={faqurl}
            className="group transition-colors inline-flex md:w-auto xs:w-[90%] 
            text-lg tracking-tight items-center justify-center gap-2 
            rounded-[20px] border-2 border-primaryAlt px-6 py-3 text-primaryAlt font-medium 
            hover:bg-primary hover:text-white hover:dark:bg-[#A6EFD9] hover:dark:text-[#010663]"
          >
            <div className="group-hover:text-white group-hover:dark:text-[#010663]">
              {secondaryLabel}
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="cta-arrow"
            >
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

