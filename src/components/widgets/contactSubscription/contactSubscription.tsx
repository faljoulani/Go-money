import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { ContactSubscriptionEntity } from './ContactSubscription.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { parseMaybeJson } from '../../../utils/utils';

import CTA from '../../atoms/cta/cta';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

type ContactBox = {
  Id?: string;
  Title?: string;
  SubTitle?: string;
  ButtonLabel?: string;
  EmailLabel?: string;
  EmailText?: string;
  EmailPlaceholder?: string;
  CallUsLabel?: string;
  CallUsText?: string;
  hasLabelCorner?: boolean;
  HasLabelCorner?: boolean;
  CTAURL?: unknown;
  Variant?: 'subscribe' | 'contact';
  Mode?: 'subscribe' | 'contact';
  Layout?: 'subscribe' | 'contact';
  IsSubscribeOnly?: boolean | string;
};

type ContactSubscriptionParent = {
  Id: string;
  Title?: string;
  UrlName?: string;
  Box?: ContactBox[] | ContactBox | null;
};

type ParsedLink = { href: string; text?: string; target?: string } | null;
const toBool = (v: any) => (typeof v === 'boolean' ? v : String(v ?? '').toLowerCase() === 'true');

function parseLink(value: any): ParsedLink {
  if (!value) return null;
  let raw: any = value;

  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return null;
    try {
      raw = JSON.parse(s);
    } catch {
      return { href: s };
    }
  }
  if (Array.isArray(raw)) raw = raw.find(Boolean) ?? null;
  if (!raw || typeof raw !== 'object') return null;

  const href = String(raw.Href ?? raw.href ?? '').trim();
  if (!href) return null;

  const text = String(raw.Text ?? raw.text ?? raw.Title ?? '').trim() || undefined;
  const target = String(raw.Target ?? raw.target ?? '').trim() || undefined;
  return { href, text, target };
}

type NormalizedBox = {
  Id?: string;
  Title?: string;
  SubTitle?: string;
  ButtonLabel?: string;
  EmailLabel?: string;
  EmailText?: string;
  EmailPlaceholder?: string;
  CallUsLabel?: string;
  CallUsText?: string;
  HasLabelCorner: boolean;
  CTA: ParsedLink;
  variant: 'subscribe' | 'contact';
};

function normalizeBoxes(boxes: ContactBox[]): NormalizedBox[] {
  return (boxes || []).map((b) => {
    const hasCorner = toBool(b.hasLabelCorner) || toBool((b as any).HasLabelCorner);
    const cta = parseLink(b.CTAURL);

    const hasInput = !!b.EmailPlaceholder && String(b.EmailPlaceholder).trim().length > 0;

    const variant: 'subscribe' | 'contact' = hasCorner
      ? 'contact'
      : hasInput
        ? 'subscribe'
        : 'contact';

    return {
      Id: b.Id,
      Title: b.Title,
      SubTitle: b.SubTitle,
      ButtonLabel: b.ButtonLabel,
      EmailLabel: b.EmailLabel,
      EmailText: b.EmailText,
      EmailPlaceholder: b.EmailPlaceholder,
      CallUsLabel: b.CallUsLabel,
      CallUsText: b.CallUsText,
      HasLabelCorner: hasCorner,
      CTA: cta,
      variant,
    };
  });
}

export default async function ContactSubscription(props: WidgetContext<ContactSubscriptionEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const properties = (props.model?.Properties || {}) as any;
  const rawSel = parseMaybeJson(properties?.ContactSubscription) ?? properties?.ContactSubscription;

  const parentId = extractSelectionId(rawSel);
  if (!parentId) {
    return isEdit ? (
      <section {...attrs} className="ContactSubscription">
        <div className="w-full rounded-2xl border border-dashed p-6 text-center text-slate-600">
          <strong>Contact Subscription</strong>
          <div className="mt-1">Open the designer and select a Contact Subscription item.</div>
        </div>
      </section>
    ) : null;
  }

  const parent = (await fetchData(
    [parentId],
    null,
    culture,
    [
      'Id',
      'Title',
      'UrlName',
      'Box(' +
        '$select=Id,Title,SubTitle,CallUsLabel,CallUsText,CTAURL,EmailLabel,EmailText,EmailPlaceholder,ButtonLabel,hasLabelCorner' +
        ')',
    ],
    { itemType: rawSel?.Content?.[0]?.Type, single: true },
  )) as ContactSubscriptionParent | null;

  const rawBoxes = Array.isArray(parent.Box) ? parent.Box : parent.Box ? [parent.Box] : [];
  const boxes = normalizeBoxes(rawBoxes);

  return (
    <section
      {...attrs}
      className="ContactSubscription bg-[var(--Background-background-neutral-200,_#EEEEEE)] py-10 md:py-14"
    >
      <div className="mx-auto max-w-[1240px] px-5">
        {parent.Title && (
          <Title
            as="h2"
            align="left"
            fontSize={40}
            fontWeight={400}
            lineHeight="100%"
            letterSpacing="-0.02em"
            maxWidth={710}
            className="mb-8"
          >
            {parent.Title}
          </Title>
        )}

        {/* Stretch items so all cards have equal height */}
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          {boxes.map((box) => (
            <div
              key={box.Id ?? box.Title}
              className="relative flex h-full flex-col overflow-visible rounded-[28px] border border-[#E2E5EA] bg-white p-6 md:p-8"
            >
              {/* Corner ribbon (from public/icons) */}
              {box.HasLabelCorner && (
                <div className="absolute w-18 h-18 bg-[#1919E5] rounded-bl-3xl top-0 right-0">
                  <div
                    className='absolute w-10 h-10 bg-white right-0 top-0'
                  ></div>
                </div>
              )}

              {/* Title / Subtitle */}
              {box.Title && (
                <Title
                  as="h3"
                  align="left"
                  variant="section"
                  fontSize={28}
                  fontWeight={700}
                  lineHeight="100%"
                  letterSpacing="-0.02em"
                  color="var(--Text-text-primary, #010663)"
                  maxWidth="none"
                  className="mb-2"
                >
                  {box.Title}
                </Title>
              )}

              {box.SubTitle && (
                <Description
                  align="left"
                  color="var(--Text-text-default, #424242)"
                  maxWidth="none"
                  className="mb-6 mt-0 text-[18px] leading-[100%] tracking-[0]"
                >
                  {box.SubTitle}
                </Description>
              )}

              {/* Variant content + CTA pinned to bottom */}
              {box.variant === 'subscribe' ? (
                <div className="flex h-full flex-col">
                  <div className="flex-1">
                    <label className="sr-only">{box.EmailLabel || 'Email'}</label>
                    <div className="mb-4 flex h-[56px] items-center rounded-2xl border border-[#DFE3EA] px-4">
                      <input
                        type="email"
                        inputMode="email"
                        placeholder={box.EmailPlaceholder || 'Enter your email address'}
                        aria-label={box.EmailLabel || 'Email'}
                        className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#9DA3AE]"
                      />
                    </div>
                  </div>

                  <CTA
                    color="#010663"
                    borderColor="#010663"
                    variant="outline"
                    width={525.2}
                    height={56.56}
                    className="mt-auto w-full max-w-[525.2px] rounded-[19.9px] border-[2.02px] px-[24.24px] py-[18.18px]"
                  >
                    {box.ButtonLabel || 'Subscribe Now'}
                  </CTA>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center text-center">
                  <div className="mb-5 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-[500px]">
                    {/* Call block */}
                    <div className="rounded-xl border border-[#E7E9EF] px-4 py-3">
                      <div className="flex items-center justify-center gap-2 text-[14px] text-[#424242]">
                        <svg
                          aria-hidden
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="shrink-0"
                        >
                          <path
                            d="M6 2h4l1 5-2 1a12 12 0 005 5l1-2 5 1v4c0 1-1 2-2 2A16 16 0 014 6c0-1 1-2 2-2z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{box.CallUsLabel || 'Call Us'}</span>
                      </div>
                      <div className="mt-2 h-px bg-[#EAEDF3]" />
                      <div className="mt-2 text-[14px] text-[#424242]">
                        {box.CallUsText || '+966 11 123 4567'}
                      </div>
                    </div>

                    {/* Email block */}
                    <div className="rounded-xl border border-[#E7E9EF] px-4 py-3">
                      <div className="flex items-center justify-center gap-2 text-[14px] text-[#424242]">
                        <svg
                          aria-hidden
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="shrink-0"
                        >
                          <path
                            d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm0 0l8 6 8-6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{box.EmailLabel || 'Email'}</span>
                      </div>
                      <div className="mt-2 h-px bg-[#EAEDF3]" />
                      <div className="mt-2 text-[14px] text-[#424242]">
                        {box.EmailText || 'support@go-money.sa'}
                      </div>
                    </div>
                  </div>

                  <CTA
                    href={box.CTA?.href || '#'}
                    target={(box.CTA?.target as '_self' | '_blank') || '_self'}
                    color="#010663"
                    borderColor="#010663"
                    variant="outline"
                    width={525.2}
                    height={56.56}
                    className="mt-auto w-full max-w-[525.2px] rounded-[19.9px] border-[2.02px] px-[24.24px] py-[18.18px]"
                  >
                    {box.ButtonLabel || box.CTA?.text || 'Contact Us'}
                  </CTA>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

