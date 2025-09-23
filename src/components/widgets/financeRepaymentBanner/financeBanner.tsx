import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import {
  fetchData,
  extractSelectionId,
  pickOneMedia,
  pickImageUrl,
} from '../../../utils/sitefinity';
import type { FinanceBannerEntity } from './financeBanner.entity';
import { resolveSitefinitySelection, mergeClasses } from '../../../utils/utils';
import { extractHref } from '../../../utils/utils';
import Title from '../../atoms/title/title';
import CTA from '../../atoms/cta/cta';

interface FinanceBannerItem {
  Id: string;
  Title?: string;
  LabelButton?: string;
  CTA?: any;
  BackgroundImage?: any | any[];
  ForegroundImage?: any | any[];
  FloatImage?: any | any[];
}

interface FinanceBannerUI {
  id: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  images: {
    backgroundUrl: { url: string; alt: string; width: number; height: number };
    foregroundUrl: { url: string; alt: string; width: number; height: number };
    floatUrl: { url: string; alt: string; width: number; height: number };
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
      'CTA',
      'BackgroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      'ForegroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      'FloatImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
    ],

    {
      itemType: selection?.Content?.[0]?.Type,
      single: true,
    },
  )) as FinanceBannerItem | null;

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

  const backgroundImage = pickOneMedia(item.BackgroundImage);
  const foregroundImage = pickOneMedia(item.ForegroundImage);
  const floatImage = pickOneMedia(item.FloatImage);

  let ctaHref: string | undefined = undefined;

  if (item?.CTA) {
    try {
      const parsed = JSON.parse(item.CTA);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ctaHref = extractHref(parsed[0]?.href);
      }
    } catch (e) {
      console.error('Invalid CtaUrl JSON:', item.CTA, e);
    }
  }

  const financeRepaymentBanner: FinanceBannerUI = {
    id: item.Id,
    title: item.Title ?? '',
    ctaLabel: item.LabelButton || item.CTA?.Text || item.CTA?.Title || 'Learn more →',
    ctaHref,
    images: {
      backgroundUrl: {
        url: pickImageUrl(backgroundImage),
        alt: (backgroundImage?.AlternativeText as string) || 'background',
        width: 1240,
        height: 550,
      },
      foregroundUrl: {
        url: pickImageUrl(foregroundImage),
        alt: (foregroundImage?.AlternativeText as string) || 'phone',
        width: 626,
        height: 550,
      },
      floatUrl: {
        url: pickImageUrl(floatImage),
        alt: (floatImage?.AlternativeText as string) || 'cards',
        width: 600,
        height: 170,
      },
    },
  };

  console.log('cta ------', financeRepaymentBanner.ctaHref);
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
        <div className="absolute inset-0 z-0 rtl:scale-x-[-1]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%), linear-gradient(97.8deg, #010663 0%, #6BE5BF 100%)',
            }}
          />

          {financeRepaymentBanner.images.backgroundUrl.url && (
            <Image
              src={financeRepaymentBanner.images.backgroundUrl.url}
              alt={financeRepaymentBanner.images.backgroundUrl.alt}
              fill
              priority
              className="object-cover"
            />
          )}
        </div>

        {/* Layer 2: content */}

        <div className="relative z-10 flex w-full items-center">
          <div className="text-white">
            <div className="flex flex-col gap-6 pl-24 rtl:pr-24 w-full max-w-[560px]">
              {/* Cards strip (maps from floatUrl → cards) under the title area */}

              {financeRepaymentBanner.images.floatUrl.url && (
                <div className="relative -left-8 -mb-12 rtl:-right-12 rtl:-mb-12 h-[180px] w-[590px] rounded-lg">
                  <Image
                    src={financeRepaymentBanner.images.floatUrl.url}
                    alt={financeRepaymentBanner.images.floatUrl.alt}
                    fill
                    priority
                  />
                </div>
              )}

              {!!financeRepaymentBanner.title && (
                <Title
                  className="text-5xl font-bold tracking-tight leading-[100%] max-w-[100%]"
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

          {financeRepaymentBanner.images.foregroundUrl.url && (
            <div className="absolute z-20 fadeRightFinance ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto">
              <Image
                src={financeRepaymentBanner.images.foregroundUrl.url}
                alt={financeRepaymentBanner.images.foregroundUrl.alt}
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

