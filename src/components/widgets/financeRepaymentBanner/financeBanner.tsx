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

  return (
    <section
      {...(attrs as any)}
      className={mergeClasses(
        'relative overflow-clip [perspective:1000px]',
        (attrs as any)?.className || '',
      )}
    >
      <div className="flex xs:flex-col md:h-[550px] xs:h-[700px] md:w-[90%] rounded-2xl md:mx-auto flip overflow-clip">
        {/* Layer 1: gradient + main background image */}
        <div className="absolute inset-0 z-0 rtl:scale-x-[-1] rounded-2xl">
          <div className="absolute inset-0 bg-finance-banner dark:bg-finance-banner-dark rounded-3xl" />

          {financeRepaymentBanner.images.backgroundUrl.url && (
            <Image
              src={financeRepaymentBanner.images.backgroundUrl.url}
              alt={financeRepaymentBanner.images.backgroundUrl.alt}
              fill
              priority
              className="md:w-[1240px] md:h-[550px] object-cover"
            />
          )}
        </div>

        {/* Layer 2: content */}

        <div className=" absolute  z-10 flex xs:w-full text-white xs:px-6 flex-col  md:pl-24 md:rtl:pr-24 md:h-full  md:max-w-[50%] md:py-20 xs:mx-auto">
          {financeRepaymentBanner.images.floatUrl.url && (
            <div className="relative  w-full xs:h-[125px]  md:-ml-[22px] md:mr-[16px] md:rtl:-right-12  rounded-lg fadeRightFinanceDetails  xs:m-auto  ">
              <Image
                src={financeRepaymentBanner.images.floatUrl.url}
                alt={financeRepaymentBanner.images.floatUrl.alt}
                fill
                priority
                className=" drop-shadow"
              />
            </div>
          )}

          <div className="fadeRightFinanceDetails ">
            {!!financeRepaymentBanner.title && (
              <Title
                className="md:text-5xl  md:font-bold md:tracking-[-0.02em] md:leading-[60px]  xs:max-w-none xs:text-[24px] xs:leading-9 xs:font-semibold
"
                color="text-white"
              >
                {financeRepaymentBanner.title}
              </Title>
            )}
          </div>

          {!!financeRepaymentBanner.ctaLabel && (
            <div className="md:mt-6 xs:mt-5">
              <CTA
                variant="outline"
                colorText="text-accent"
                fontWeight="font-light"
                borderColor="border-accent"
                align="center"
                icon="slot"
                bgColor="transparent"
                href={financeRepaymentBanner.ctaHref}
                className="md:w-auto xs:w-full xs:h-12 xs:rounded-xl xs:py-6 fadeRightFinanceButton"
              >
                {financeRepaymentBanner.ctaLabel}
              </CTA>
            </div>
          )}
        </div>

        {/* Phone image on the right (foregroundUrl → phone) */}

        {financeRepaymentBanner.images.foregroundUrl.url && (
          <div
            className="md:absolute xs:mt-auto xs:absolute xs:bottom-10 md:z-20 xs:rtl:left-0 xs:ltr:right-0 md:ltr:right-0 md:ltr:left-auto md:rtl:left-0 md:rtl:right-auto fadeRightFinance
                    "
          >
            <Image
              src={financeRepaymentBanner.images.foregroundUrl.url}
              alt={financeRepaymentBanner.images.foregroundUrl.alt}
              width={550}
              height={900}
              priority
              className="
                md:w-[550px] md:h-[500px]  xs:w-[360px]  xs:h-auto w-full xs:translate-y-10
                pointer-events-none  animate-float xs:inset-x-0 xs:left-0
              "
            />
          </div>
        )}
      </div>
    </section>
  );
}

