import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import type { FinanceBannerEntity } from './financeBanner.entity';
import { resolveSitefinitySelection, mergeClasses } from '../../../utils/utils';
import { extractHref } from '../../../utils/utils';
import Title from '../../atoms/title/title';
import CTA from '../../atoms/cta/cta';

// Helper to read a URL from a Sitefinity media object

function mediaUrl(im?: any | null): string {
  if (!im) return '';
  return im.MediaUrl || im.Url || im.ThumbnailUrl || im.EmbedUrl || '';
}

// Pick a single media from Sitefinity related media field (array or single)

function pickOneMedia(img: any | any[] | null | undefined) {
  const media = Array.isArray(img) ? img[0] : img;
  return media || null;
}

// Raw item shape coming from Module Builder

interface FinanceBannerItemRaw {
  Id: string;
  Title?: string;
  LabelButton?: string;
  CTA?: any; // Link (Href/Url/Text/Title)
  BackgroundImage?: any | any[];
  ForegroundImage?: any | any[];
  FloatImage?: any | any[];
}

// Normalized UI shape (matches your console example exactly)

interface FinanceRepaymentBannerUI {
  id: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  images: {
    mainBg: { url: string; alt: string; width: number; height: number };
    phone: { url: string; alt: string; width: number; height: number };
    cards: { url: string; alt: string; width: number; height: number };
  };
}

export default async function FinanceBanner(props: WidgetContext<FinanceBannerEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;
  const selection = resolveSitefinitySelection((props.model?.Properties as any)?.FinanceBanner);
  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...(attrs as any)}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>Select a FinanceBanner item</strong>
        <div className="mt-1">Open the designer and select the desired item.</div>
      </section>
    ) : null;
  }

  const item = (await fetchData(
    [id],
    null,
    culture,
    [
      'Id',
      'Title',
      'LabelButton',
      'CTA($select=Href,Url,Text,Title)',
      'BackgroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      'ForegroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      'FloatImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
    ],

    {
      itemType: selection?.Content?.[0]?.Type,
      single: true,
    },
  )) as FinanceBannerItemRaw | null;

  if (!item) {
    return isEdit ? (
      <section
        {...(attrs as any)}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        No FinanceBanner item was found.
      </section>
    ) : null;
  }

  // Build the exact UI object you logged in console

  const bg = pickOneMedia(item.BackgroundImage);
  const fg = pickOneMedia(item.ForegroundImage);
  const fl = pickOneMedia(item.FloatImage);

  const financeRepaymentBanner: FinanceRepaymentBannerUI = {
    id: item.Id,
    title: item.Title ?? '',
    ctaLabel: item.LabelButton || item.CTA?.Text || item.CTA?.Title || 'Learn more →',
    ctaHref: extractHref(item.CTA) || '#',
    images: {
      // backgroundUrl → mainBg
      mainBg: {
        url: mediaUrl(bg),
        alt: (bg?.AlternativeText as string) || 'background',
        width: 1240,
        height: 550,
      },

      // foregroundUrl → phone

      phone: {
        url: mediaUrl(fg),
        alt: (fg?.AlternativeText as string) || 'phone',
        width: 626,
        height: 550,
      },

      // floatUrl → cards

      cards: {
        url: mediaUrl(fl),
        alt: (fl?.AlternativeText as string) || 'cards',
        width: 600,
        height: 170,
      },
    },
  };

  const viewName = props.model?.Properties?.ViewName || 'Default';

  return (
    <section
      {...(attrs as any)}
      className={mergeClasses(
        'relative overflow-clip [perspective:1000px]',
        (attrs as any)?.className || '',
      )}
    >
      <div className="flex h-[550px] w-auto items-center rounded-[32px] mx-20 flip overflow-clip">
        {/* Layer 1: gradient + main background image */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%), linear-gradient(97.8deg, #010663 0%, #6BE5BF 100%)',
            }}
          />

          {financeRepaymentBanner.images.mainBg.url && (
            <Image
              src={financeRepaymentBanner.images.mainBg.url}
              alt={financeRepaymentBanner.images.mainBg.alt}
              fill
              priority
              className="object-cover"
            />
          )}
        </div>

        {/* Layer 2: content */}

        <div className="relative z-10 flex w-full items-center">
          <div className="text-white">
            <div className="flex flex-col pl-24 w-full max-w-[560px]">
              {viewName === 'WithHeading' && (
                <div className="text-surface/90 text-sm tracking-wide uppercase">Finance</div>
              )}

              {/* Cards strip (maps from floatUrl → cards) under the title area */}

              {financeRepaymentBanner.images.cards.url && (
                <div className="relative -left-8 h-[160px] w-[540px] rounded-lg">
                  <Image
                    src={financeRepaymentBanner.images.cards.url}
                    alt={financeRepaymentBanner.images.cards.alt}
                    fill
                    priority
                  />
                </div>
              )}

              {!!financeRepaymentBanner.title && (
                <Title
                  className="text-[44px] font-bold tracking-tight leading-tight max-w-[100%] mb-6"
                  color="text-white"
                >
                  {financeRepaymentBanner.title}
                </Title>
              )}

              {!!financeRepaymentBanner.ctaLabel && (
                <div>
                  <CTA
                    variant="outline"
                    colorText="text-white"
                    fontText="font-lufga"
                    fontWeight="font-light"
                    borderColor="border-white"
                    align="left"
                    icon="slot"
                    bgColor="transparent"
                    href={financeRepaymentBanner.ctaHref}
                  >
                    {financeRepaymentBanner.ctaLabel}
                  </CTA>
                </div>
              )}
            </div>
          </div>

          {/* Phone image on the right (foregroundUrl → phone) */}

          {financeRepaymentBanner.images.phone.url && (
            <div className="absolute right-0 z-20 fadeRightFinanch">
              <Image
                src={financeRepaymentBanner.images.phone.url}
                alt={financeRepaymentBanner.images.phone.alt}
                width={550}
                height={900}
                priority
                className="pointer-events-none select-none animate-float"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

