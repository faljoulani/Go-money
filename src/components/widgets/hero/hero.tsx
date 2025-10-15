import {
  WidgetContext,
  htmlAttributes,
  RenderWidgetService,
} from '@progress/sitefinity-nextjs-sdk';
import type { HeroEntity } from './hero.entity';
import Image from 'next/image';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import { resolveSitefinitySelection, resolveAbsoluteUrl, linkToHref } from '../../../utils/utils';
import { fetchData, pickOneMedia, getImageSrc } from '../../../utils/sitefinity';
import SimpleHeroDynamic from './simpleHeroDynamic.client';

const VIDEO_PATH = 'assets/header_v.mp4';

export async function Hero(props: WidgetContext<HeroEntity>) {
  const attrs = htmlAttributes(props);
  const lang = props.requestContext.culture;
  let isAr: boolean = false;
  if (lang === 'ar') {
    isAr = true;
  }
  const heroLang: 'en' | 'ar' = lang === 'ar' ? 'ar' : 'en';
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';

  const selection = resolveSitefinitySelection(
    props.model?.Properties?.Hero ?? (props.model?.Properties as any)?.Hero,
  );

  const heroType = selection?.Content?.[0]?.Type as string | undefined;
  const heroId = selection?.ItemIdsOrdered?.[0]?.toString();

  const heroFields = [
    'Id',
    'Title',
    'Subtitle',
    'Description',
    'Eyebrow',
    'CtaText',
    'CtaUrl',
    'FullTitle',
    'BackgroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Provider,Urls)',
  ];

  let item: any = null;
  if (heroType && heroId) {
    try {
      item = await fetchData(
        [heroId],
        { Cards: { ItemIdsOrdered: [heroId] } },
        props.requestContext.culture,
        heroFields,
        { itemType: heroType, single: true },
      );
    } catch {
      item = null;
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return (
        <section
          {...attrs}
          className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
        >
          <strong> Select a Hero item.</strong>
          <div className="mt-1">Open the designer and select the desired item.</div>
        </section>
      );
    }
    return null;
  }

  const eyebrow = item.Eyebrow || '';
  const title = item.Title || '';
  const subtitle = item.Subtitle || '';
  const description = item.Description || '';
  const fulltitle = item.FullTitle || '';
  const ctaText = item.CtaText || 'Learn more';
  let rawCtaUrl = item.CtaUrl;
  function normalizeAssetUrl(p: string, culture: string) {
    let s = String(p)
      .replace(/^url\((.*)\)$/i, '$1')
      .trim()
      .replace(/^['"]|['"]$/g, '');
    if (!s.startsWith('/')) s = '/' + s;
    const localePrefix = `/${culture}/`;
    if (s.startsWith(localePrefix)) s = s.slice(localePrefix.length - 1);
    return s;
  }
  const videoSrc = normalizeAssetUrl(VIDEO_PATH, props.requestContext.culture);

  try {
    if (typeof rawCtaUrl === 'string') {
      rawCtaUrl = JSON.parse(rawCtaUrl);
    }
  } catch {
    // If parsing fails, leave it as-is
  }

  const ctaUrl = linkToHref(rawCtaUrl);
  let bgMedia = pickOneMedia(item.BackgroundImage);
  if (bgMedia && !getImageSrc(bgMedia) && bgMedia.Id) {
    try {
      const image = await fetchData(
        [bgMedia.Id.toString()],
        { Cards: { ItemIdsOrdered: [bgMedia.Id.toString()] } },
        props.requestContext.culture,
        ['Id', 'Url', 'MediaUrl', 'ThumbnailUrl', 'EmbedUrl', 'Title', 'AlternativeText', 'Urls'],
        { itemType: selection?.Content?.[0]?.Type, single: true },
      );
      bgMedia = { ...image, ...bgMedia };
    } catch (err) {
      console.warn('Could not fetch background image for Hero component');
    }
  }

  const bgUrl = getImageSrc(bgMedia);
  const bgAlt = bgMedia?.AlternativeText || bgMedia?.Title || title;
  const heroImgUrl = resolveAbsoluteUrl(bgUrl, props.requestContext);

  const breadcrumbs = props.model.Children.filter((c) => c.PlaceHolder === 'Breadcrumb').map(
    (m) => ({ model: m, requestContext: props.requestContext }),
  );

  const isSimple = selectedView === 'Simple';

  if (isSimple) {
    const breadcrumbSlot = (
      <div className="mx-auto px-6 xs:mt-44 md:mt-32">
        <div className="mb-5" data-sfcontainer="Breadcrumb">
          {breadcrumbs.map((y) =>
            RenderWidgetService.createComponent(y.model, props.requestContext),
          )}
        </div>
      </div>
    );

    return (
      <section
        {...attrs}
        className={`max-w-[2000px] xxl:mx-auto relative isolate overflow-hidden text-white 
              flex flex-col items-center justify-start rounded-2xl
              min-h-[320px] h-[450px] px-4 
              bg-[url('/assets/HeroBackground.png')] dark:bg-[url('/assets/HeroBackgroundDark.png')] 
              bg-cover bg-center`}
      >
        <SimpleHeroDynamic
          lang={heroLang}
          defaultTitle={title || ''}
          subtitleHtml={subtitle ?? undefined}
          descriptionHtml={description ?? undefined}
          breadcrumbs={breadcrumbSlot}
          titleClassName="md:text-[40px] font-bold mb-3 text-white tracking-tight md:leading-[52px] xs:text-2xl xs:leading-8 w-auto text-center"
          subtitleClassName="text-white md:w-[485px] mx-auto text-center md:font-bold md:leading-7 xs:font-normal xs:leading-5 mb-1 xs:w-[295px]"
          descriptionClassName="text-white md:w-[485px] mx-auto text-center rtl:leading-7 leading-5 xs:w-[295px]"
        />
      </section>
    );
  }
  return (
    <section
      {...attrs}
      className="relative max-w-[2000px] xxl:mx-auto overflow-hidden text-white rounded-[32px] 
      md:h-[700px] xs:flex xs:flex-col xs:h-[752px] 
      dark:bg-[linear-gradient(130deg,#001a52_15%,#010e4a_40%,#1DB5B3_100%)]
"
    >
      <img
        src="/assets/HeroBackground.jpg"
        className="video-background absolute inset-0 -z-20 w-full h-full object-cover rounded-[30px] pointer-events-none"
      ></img>
      <video
        suppressHydrationWarning
        className="video-background absolute inset-0 -z-10 w-full h-full object-cover rounded-[30px] pointer-events-none"
        src={videoSrc}
        autoPlay
        muted
        playsInline
        loop
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* decorative glows */}
      <div
        aria-hidden
        className=" xs:hidden pointer-events-none md:absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-cyan-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className=" xs:hidden pointer-events-none md:absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-400/30 blur-3xl"
      />

      <div className="relative md:grid md:grid-cols-2 md:gap-16 md:max-w-7xl md:px-20 md:py-24 xs:flex xs:flex-col xs:px-4 xs:pt-28">
        <div className="flex flex-col items-start justify-center md:mt-20 fadeLeftHero xs:mb-4">
          {eyebrow && (
            <Eyebrow className="md:text-lg xs:text-sm md:leading-6 xs:leading-[18px]" color="white">
              {eyebrow}
            </Eyebrow>
          )}

          {fulltitle && (
            <Title html={fulltitle}
              color="text-white"
              className="mt-1 mx-0 md:max-w-[500px] xs:w-[80%] font-bold md:text-[48px] xs:text-2xl md:leading-[63px] rtl:md:leading-[90px] tracking-[-0.02em] xs:leading-8 rtl:xs:leading-[45px] mb-4"
            />
             
          )}
          
          {/* {title && (
            <Title
              color="text-white"
              className="mt-1 mx-0 md:max-w-[500px] xs:w-[80%] font-bold md:text-[48px] xs:text-2xl md:leading-[63px] rtl:md:leading-[90px] tracking-[-0.02em] xs:leading-8 rtl:xs:leading-[45px] mb-4"
            >
              {title}
            </Title>
          )} */}

          {description && (
            <Description html={description} className="text-white mb-4 leading-5 rtl:leading-8" />
          )}

          {ctaText && (
            <div>
              <CTA
                variant="outline"
                colorText="text-white"
                fontWeight="font-medium"
                borderColor="border-white"
                icon="slot"
                bgColor="transparent"
                href={ctaUrl || '#'}
              >
                {ctaText}
              </CTA>
            </div>
          )}
        </div>
      </div>
      <div
        className={`
    xs:absolute xs:inset-x-0 xs:bottom-0 xs:flex xs:justify-center xs:h-[330px] xs:w-auto
    md:absolute ${isAr ? 'md:mr-[32%] lg:ml-[37%] xl:mr-[50%] ' : 'md:ml-[32%] lg:ml-[37%] xl:ml-[50%]'}
    md:flex md:-bottom-8 md:w-[700px] md:h-[650px] fadeupHero
  `}
      >
        {/* <div
          className="
          p-4
      relative
      md:h-[660px] md:w-full
      xs:h-[330px] xs:w-[72%] xs:max-w-[420px] xs:bottom-0 xs:inset-x-0
    "
        > */}
        {heroImgUrl ? (
          <Image
            src={heroImgUrl}
            alt={bgAlt || 'Hero image'}
            fill
            priority
            quality={90}
            className="xs:object-fill md:object-fill"
          />
        ) : (
          <div className="absolute inset-0 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl" />
        )}
      </div>
      {/* </div> */}
    </section>
  );
}

export default Hero;
