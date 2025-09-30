import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { ContactSubscriptionEntity } from './contactSubscription.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, extractHref, linkToHref } from '../../../utils/utils';

import SubscribeEmailForm from './subscribeEmailForm';
import CTA from '../../atoms/cta/cta';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import Image from 'next/image';

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
  if (explicit) return explicit as 'subscribe' | 'contact';
  const hasCorner = box.HasLabelCorner ?? box.hasLabelCorner;
  return hasCorner ? 'contact' : box.EmailPlaceholder ? 'subscribe' : 'contact';
};

function Card({ box, className = '' }: { box: ContactBox; className?: string }) {
  const variant = getVariant(box);
  const isSubscribe = variant === 'subscribe';
  const hasCorner = box.HasLabelCorner ?? box.hasLabelCorner;
  let rawCtaUrl = box.CTAURL;

  try {
    if (typeof rawCtaUrl === 'string') {
      rawCtaUrl = JSON.parse(rawCtaUrl);
    }
  } catch {
    // If parsing fails, leave it as-is.
  }

  const ctaHref = linkToHref(rawCtaUrl);
  const ctaText = box.ButtonLabel || box.CTAURL?.Text || box.CTAURL?.text || 'Contact Us';
  const ctaTarget = (box.CTAURL?.Target || box.CTAURL?.target || '_self') as '_self' | '_blank';

  // const cornerSide = isRTL ? 'left-0' : 'right-0';
  // const cornerRound = isRTL ? 'rounded-br-[60px]' : 'rounded-bl-[60px]';
  // const notchSide = cornerSide;

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-[#E2E5EA] bg-white p-6 md:p-8 flex flex-col justify-between ${className}`}
    >
      {/* Corner label only for contact variant */}
      {hasCorner && !isSubscribe && (
        <div
          className={`pointer-events-none absolute top-0 ltr:right-0 rtl:left-0 ltr:rounded-br-[60px] rtl:rounded-bl-[60px] ltr:rotate-90 rtl:rotate-[270deg] h-[110px] w-[110px] bg-secondary`}
        >
          <div className={`absolute h-[52px] w-[52px] bg-white`} />
        </div>
      )}

      {(box.Title || box.SubTitle) && (
        <div className="flex flex-col gap-3">
          {box.Title && (
            <Title color="text-primary" className="text-[28px] font-bold tracking-[-0.02em]">
              {box.Title}
            </Title>
          )}
          {box.SubTitle &&
            (isSubscribe ? (
              <Description maxWidth="none" className="mt-0 md:text-lg xs:text-[1rem] xs:mb-2 leading-6">
                {box.SubTitle}
              </Description>
            ) : (
              <Description maxWidth="none" className="mt-0 w-72 text-lg leading-6 mb-8">
                {box.SubTitle}
              </Description>
            ))}
        </div>
      )}

      {isSubscribe ? (
        <div>
          <SubscribeEmailForm
            placeholder={box.EmailPlaceholder || 'Enter your email address'}
            label={box.EmailLabel || 'Email'}
            button={box.ButtonLabel || 'Subscribe Now'}
            endpoint="api/default/SubscriptionEmails"
            className="flex flex-col h-full [&>button[type=submit]]:mt-auto"
          />
        </div>
      ) : (
        <div className="flex flex-col justify-end items-center text-center h-full">
          <div className="grid md:grid-cols-2 xs:grid-cols-1 mb-8 w-full max-w-[520px] gap-3">
            <div className="rounded-xl border border-lineMuted px-4 pb-3 pt-5">
              <div className="flex items-center justify-center gap-2 text-14px text-default">
                <Image src="/icons/phone.svg" alt="phone" width={17} height={17} />
                <span>{box.CallUsLabel || 'Call Us'}</span>
              </div>
              <div className="mt-2 h-px bg-lineMuted" />
              <div className="mt-2 text-xs text-default">
                {box.CallUsText || '+966 11 123 4567'}
              </div>
            </div>
            <div className="rounded-xl border border-lineMuted px-4 pb-3 pt-5">
              <div className="flex items-center justify-center gap-2 text-14px text-default">
                <Image src="/icons/mail.svg" alt="email" width={17} height={17} />
                <span className="text-xs">{box.EmailLabel || 'Email'}</span>
              </div>
              <div className="mt-2 h-px bg-lineMuted" />
              <div className="mt-2 text-xs text-default">
                {box.EmailText || 'support@go-money.sa'}
              </div>
            </div>
          </div>
          <div className=" w-full max-w-[525px]">
            <CTA
              href={ctaHref}
              target={ctaTarget}
              borderColor="border-primary"
              variant="outline"
              icon="arrow"
              className="w-full max-w-[525px] text-lg font-medium tracking-[-0.025%em] rounded-[20px] border-[2px] mt-auto px-6 py-[18px]"
            >
              {ctaText}
            </CTA>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function ContactSubscription(props: WidgetContext<ContactSubscriptionEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;
  const isRTL = (culture || '').toLowerCase().startsWith('ar');

  const properties = (props.model?.Properties || {}) as any;
  const rawSel =
    resolveSitefinitySelection(properties?.ContactSubscription) ?? properties?.ContactSubscription;
  const parentId = extractSelectionId(rawSel);

  if (!parentId) {
    return isEdit ? (
      <section {...attrs}>
        <div className="w-full rounded-2xl border border-dashed p-6 text-center text-default">
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

  const lines = parent.Title.split('\n');

  return (
    <section {...attrs} className=" px-5 overflow-clip mt-16">
      <div className="mx-auto max-w-[1240px]">
        {parent?.Title && (
          <div className="mb-10">
            <Title
              color="text-primary"
              className="md:text-40px xs:text-[1.3rem] tracking-[-0.02em] max-w-[720px] md:leading-[52px]"
            >
              {parent.Title}
            </Title>
          </div>
        )}

        <div className="grid md:grid-cols-2 xs:grid-cols-1 gap-8 items-stretch">
          {left && <Card box={left} className="fadeLeftSubscribe h-full" />}
          {right && <Card box={right} className="fadeRightSubscribe h-full" />}
        </div>
      </div>
    </section>
  );
}

