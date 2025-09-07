import Link from 'next/link';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { ContactSubscriptionEntity } from './ContactSubscription.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import CTA from '../../atoms/cta/cta';

/* ------------------------------- Types & Utils ------------------------------- */

type AnySel = any;

type ContactBox = {
  Id?: string;
  Title?: string;
  SubTitle?: string;
  ButtonLabel?: string;
  EmailLabel?: string;
  EmailText?: string; // contact email text (e.g., support@...)
  EmailPlaceholder?: string; // subscribe input placeholder
  CallUsLabel?: string;
  CallUsText?: string; // phone number
  hasLabelCorner?: boolean;
  HasLabelCorner?: boolean;
  CTAURL?: unknown; // string | object | array
  // Optional explicit controls (if you add them in SF later):
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

function parseMaybeJson<T = any>(value: unknown): T | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {}
  }
  return undefined;
}

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

/* ---------------------------- Variant normalization --------------------------- */

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

/** Robust detection:
 *  1) Respect explicit fields if present (Variant/Mode/Layout/IsSubscribeOnly).
 *  2) Else subscribe when: has email input placeholder AND no phone AND no contact email.
 *  3) Otherwise contact.
 */
function normalizeBoxes(boxes: ContactBox[]): NormalizedBox[] {
  return (boxes || []).map((b) => {
    const hasCorner = toBool(b.hasLabelCorner) || toBool((b as any).HasLabelCorner);
    const cta = parseLink(b.CTAURL);

    const hasInput = !!b.EmailPlaceholder && String(b.EmailPlaceholder).trim().length > 0;

    // Variant rule:
    // 1) Corner means contact
    // 2) Otherwise if there is an input placeholder -> subscribe
    // 3) Fallback -> contact
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

function Placeholder() {
  return (
    <div className="w-full rounded-2xl border border-dashed p-6 text-center text-slate-600">
      <strong>Contact Subscription</strong>
      <div className="mt-1">Open the designer and select a Contact Subscription item.</div>
    </div>
  );
}

/* --------------------------------- Component --------------------------------- */

const SUBSCRIPTION_TYPE =
  'Telerik.Sitefinity.DynamicTypes.Model.ContactSubscription.Contactsubscription';

export default async function ContactSubscription(props: WidgetContext<ContactSubscriptionEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  // Read MixedContent
  const properties = (props.model?.Properties || {}) as any;
  const rawSel = parseMaybeJson(properties?.ContactSubscription) ?? properties?.ContactSubscription;

  const parentId = extractSelectionId(rawSel);
  if (!parentId) {
    return isEdit ? (
      <section {...attrs} className="ContactSubscription">
        <Placeholder />
      </section>
    ) : null;
  }

  // Fetch parent
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
    { itemType: SUBSCRIPTION_TYPE, single: true },
  )) as ContactSubscriptionParent | null;

  console.log('PARENT ====== >>>>>>>>>>>> ' + JSON.stringify(parent));
  if (!parent) {
    return isEdit ? (
      <section {...attrs} className="ContactSubscription">
        <Placeholder />
      </section>
    ) : null;
  }

  const rawBoxes = Array.isArray(parent.Box) ? parent.Box : parent.Box ? [parent.Box] : [];
  const boxes = normalizeBoxes(rawBoxes);

  return (
    <section
      {...attrs}
      className="ContactSubscription bg-[var(--Background-background-neutral-200,_#EEEEEE)] py-10 md:py-14"
    >
      <div className="mx-auto max-w-[1240px] px-5">
        {parent.Title && (
          <h2 className="mb-8 font-lufga text-[28px] sm:text-[36px] md:text-[44px] leading-[1.1] font-bold text-[#010663]">
            {parent.Title}
          </h2>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {boxes.map((box) => (
            <div
              key={box.Id ?? box.Title}
              className="relative overflow-hidden rounded-[28px] border border-[#E2E5EA] bg-white p-6 md:p-8"
            >
              {/* L-corner only where enabled (typically contact card) */}
              {box.HasLabelCorner && (
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[28px] bg-[#0B2A8E]" />
                  <div className="absolute right-0 top-0 h-7 w-12 rounded-bl-[16px] bg-white" />
                </div>
              )}

              {box.Title && (
                <div className="mb-2 font-lufga text-[22px] md:text-[24px] font-semibold leading-tight text-[#010663]">
                  {box.Title}
                </div>
              )}
              {box.SubTitle && (
                <p className="mb-6 text-[14px] leading-[22px] text-[#424242]/90">{box.SubTitle}</p>
              )}

              {box.variant === 'subscribe' ? (
                /* ============================== SUBSCRIBE ============================== */
                <div>
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
                    color="#010663"
                    borderColor="#010663"
                    variant="outline"
                    width={525.2}
                    height={56.56}
                    className="w-full max-w-[525.2px] rounded-[19.9px] border-[2.02px] px-[24.24px] py-[18.18px]"
                  >
                    {box.ButtonLabel || 'Subscribe Now'}
                  </CTA>
                </div>
              ) : (
                /* =============================== CONTACT =============================== */
                <div>
                  <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Call block */}
                    <div className="rounded-xl border border-[#E7E9EF] px-4 py-3">
                      <div className="flex items-center gap-2 text-[14px] text-[#424242]">
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
                      <div className="flex items-center gap-2 text-[14px] text-[#424242]">
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
                    className="w-full max-w-[525.2px] rounded-[19.9px] border-[2.02px] px-[24.24px] py-[18.18px]"
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

