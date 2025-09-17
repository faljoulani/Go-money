import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { ContactSubscriptionEntity } from './contactSubscription.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, extractHref } from '../../../utils/utils';

import SubscribeEmailForm from './subscribeEmailForm';
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
  hasLabelCorner?: boolean | string;
  HasLabelCorner?: boolean | string;
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

const getVariant = (box: ContactBox): 'subscribe' | 'contact' => {
  const explicit = box.Variant || box.Mode || box.Layout;
  if (explicit) return explicit;
  const hasCorner = box.HasLabelCorner ?? box.hasLabelCorner;
  return hasCorner ? 'contact' : box.EmailPlaceholder ? 'subscribe' : 'contact';
};

function Card({ box, className = '' }: { box: ContactBox; className?: string }) {
  const variant = getVariant(box);
  const isSubscribe = variant === 'subscribe';
  const hasCorner = box.HasLabelCorner ?? box.hasLabelCorner;

  const ctaHref = extractHref(box.CTAURL) || '#';
  const ctaText = box.ButtonLabel || box.CTAURL?.Text || box.CTAURL?.text || 'Contact Us';
  const ctaTarget = (box.CTAURL?.Target || box.CTAURL?.target || '_self') as '_self' | '_blank';

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-[#E2E5EA] bg-white p-6 md:p-8 ${className}`}
    >
      {/* corner only for contact */}
      {hasCorner && !isSubscribe && (
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
          {box.SubTitle &&
            (isSubscribe ? (
              <Description
                align="left"
                maxWidth="none"
                className="mt-0 text-lg font-normal leading-5"
              >
                {box.SubTitle}
              </Description>
            ) : (
              <Description
                align="left"
                color=""
                maxWidth="none"
                className="mt-0 text-[28px] w-72 text-lg font-normal leading-5"
              >
                {box.SubTitle}
              </Description>
            ))}
        </div>
      )}

      {isSubscribe ? (
        <div className="mt-8">
          <SubscribeEmailForm
            placeholder={box.EmailPlaceholder || 'Enter your email address'}
            label={box.EmailLabel || 'Email'}
            button={box.ButtonLabel || 'Subscribe Now'}
            endpoint="api/default/SubscriptionEmails"
          />
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
            href={ctaHref}
            target={ctaTarget}
            borderColor="border-primary"
            variant="outline"
            icon="arrow"
            className="w-full max-w-[525px] font-semibold rounded-[20px] border-[2px] px-6 py-[18px]"
          >
            {ctaText}
          </CTA>
        </div>
      )}
    </div>
  );
}

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
      'Box($select=Id,Title,SubTitle,CallUsLabel,CallUsText,CTAURL,EmailLabel,EmailText,EmailPlaceholder,ButtonLabel,hasLabelCorner,HasLabelCorner,Variant,Mode,Layout)',
    ],
    { itemType: rawSel?.Content?.[0]?.Type, single: true },
  )) as ContactSubscriptionParent | null;

  const items = Array.isArray(parent?.Box) ? parent!.Box : parent?.Box ? [parent!.Box] : [];

  const left = items.find((x) => getVariant(x) === 'subscribe') ?? items[0];
  const right = items.find((x) => x !== left) ?? items[1];

  return (
    <section {...attrs} className="defaultBgColor px-5 py-12 md:py-16 overflow-clip">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 items-stretch">
          {left && <Card box={left} className="fadeLeftSubscribe h-full" />}
          {right && <Card box={right} className="fadeRightSubscribe h-full" />}
        </div>
      </div>
    </section>
  );
}

