import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { ContactSubscriptionEntity } from './contactSubscription.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { resolveSitefinitySelection } from '../../../utils/utils';

import CTA from '../../atoms/cta/cta';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

/* — helpers — */
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
  CTAURL?: any;
  Variant?: 'subscribe' | 'contact';
  Mode?: 'subscribe' | 'contact';
  Layout?: 'subscribe' | 'contact';
};
type ContactSubscriptionParent = {
  Id: string;
  Title?: string;
  Box?: ContactBox[] | ContactBox | null;
};

const toBool = (v: any) => (typeof v === 'boolean' ? v : String(v ?? '').toLowerCase() === 'true');
const parseLink = (v: any) => {
  if (!v) return null;
  try {
    const o = typeof v === 'string' ? JSON.parse(v) : Array.isArray(v) ? v[0] : v;
    const href = String(o?.Href ?? o?.href ?? '').trim();
    if (!href) return null;
    return { href, text: o?.Text || o?.text, target: o?.Target || o?.target };
  } catch {
    return typeof v === 'string' ? { href: v } : null;
  }
};
const normalize = (b: ContactBox) => {
  const hasCorner = toBool((b as any).HasLabelCorner) || toBool(b.hasLabelCorner);
  const hasInput = !!b.EmailPlaceholder;
  const variant =
    (b.Variant || b.Mode || b.Layout) ??
    (hasCorner ? 'contact' : hasInput ? 'subscribe' : 'contact');
  return {
    ...b,
    HasLabelCorner: hasCorner,
    variant: variant as 'subscribe' | 'contact',
    CTA: parseLink(b.CTAURL),
  };
};

/* — small, single card — */
function Card({ box, className = '' }: { box: ReturnType<typeof normalize>; className?: string }) {
  const isSubscribe = box.variant === 'subscribe';
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-[#E2E5EA] bg-white p-6 md:p-8 ${className}`}
    >
      {/* corner only for contact */}
      {box.HasLabelCorner && !isSubscribe && (
        <div className="pointer-events-none absolute right-0 top-0 h-[110px] w-[110px] rounded-bl-[60px] bg-[#1919E5]">
          <div className="absolute right-0 top-0 h-[52px] w-[52px] bg-white" />
        </div>
      )}

      {(box.Title || box.SubTitle) && (
        <div className="flex flex-col gap-3">
          {box.Title && (
            <Title align="left" color="text-primary" className="text-left text-40px leading-10">
              {box.Title}
            </Title>
          )}
          {box.SubTitle && isSubscribe ? (
            <Description
              align="left"
              color="text-14px font-normal leading-5"
              maxWidth="none"
              className="mt-0 text-28px"
            >
              {box.SubTitle}
            </Description>
          ) : (
            <Description
              align="left"
              color="text-14px font-normal leading-5"
              maxWidth="none"
              className="mt-0 text-[28px] w-72"
            >
              {box.SubTitle}
            </Description>
          )}
        </div>
      )}

      {isSubscribe ? (
        <div className="mt-8">
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
          <CTA
            borderColor="border-primary"
            variant="outline"
            icon="arrow"
            className="w-full rounded-[20px] border-[2px] px-6 py-[18px]"
          >
            {box.ButtonLabel || 'Subscribe Now'}
          </CTA>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="mb-8 grid w-full max-w-[520px] grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#E7E9EF] px-4 pb-3 pt-5">
              <div className="flex items-center justify-center gap-2 text-[14px] text-[#424242]">
                {/* phone icon */}
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
              <div className="mt-2 text-xs text-[#424242]">
                {box.CallUsText || '+966 11 123 4567'}
              </div>
            </div>
            <div className="rounded-xl border border-[#E7E9EF] px-4 pb-3 pt-5">
              <div className="flex items-center justify-center gap-2 text-[14px] text-[#424242]">
                {/* mail icon */}
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
                <span className="text-xs">{box.EmailLabel || 'Email'}</span>
              </div>
              <div className="mt-2 h-px bg-[#EAEDF3]" />
              <div className="mt-2 text-xs text-[#424242]">
                {box.EmailText || 'support@go-money.sa'}
              </div>
            </div>
          </div>
          <CTA
            href={box.CTA?.href || '#'}
            target={(box.CTA?.target as '_self' | '_blank') || '_self'}
            borderColor="border-primary"
            variant="outline"
            icon="arrow"
            className="w-full max-w-[525px] rounded-[20px] border-[2px] px-6 py-[18px]"
          >
            {box.ButtonLabel || box.CTA?.text || 'Contact Us'}
          </CTA>
        </div>
      )}
    </div>
  );
}

/* — main — */
export default async function ContactSubscription(props: WidgetContext<ContactSubscriptionEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const properties = (props.model?.Properties || {}) as any;
  const rawSel =
    resolveSitefinitySelection(properties?.ContactSubscription) ?? properties?.ContactSubscription;
  const parentId = extractSelectionId(rawSel);

  if (!parentId) {
    return isEdit ? (
      <section {...attrs}>
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
      'Box($select=Id,Title,SubTitle,CallUsLabel,CallUsText,CTAURL,EmailLabel,EmailText,EmailPlaceholder,ButtonLabel,hasLabelCorner)',
    ],
    { itemType: rawSel?.Content?.[0]?.Type, single: true },
  )) as ContactSubscriptionParent | null;

  const raw = Array.isArray(parent?.Box) ? parent?.Box : parent?.Box ? [parent?.Box] : [];
  const items = raw.map(normalize);

  // decide left/right (subscribe then contact)
  const left = items.find((x) => x.variant === 'subscribe') ?? items[0];
  const right = items.find((x) => x !== left) ?? items[1];

  return (
    <section {...attrs} className="defaultBgColor px-5 py-12 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        {parent?.Title && (
          <div className="mb-8 md:mb-10">
            <Title
              align="left"
              color="text-primary"
              className="font-lufga text-left font-normal text-[40px] leading-[100%] tracking-[-0.02em] max-w-[720px]"
            >
              {parent.Title}
            </Title>
          </div>
        )}

        {/* each card is standalone → add your animations here */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 items-stretch">
          {left && <Card box={left} className="fadeLeftSubscribe h-full" />}
          {right && <Card box={right} className="fadeRightSubscribe h-full" />}
        </div>
      </div>
    </section>
  );
}

