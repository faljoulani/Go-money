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

export async function Hero(props: WidgetContext<HeroEntity>) {
  const attrs = htmlAttributes(props);
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
  const ctaText = item.CtaText || 'Learn more';
  let rawCtaUrl = item.CtaUrl;

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
    return (
      <section
        {...attrs}
        className="relative isolate overflow-hidden text-white flex items-center justify-center flex-col rounded-2xl
             min-h-[320px] h-[450px] px-4" // add padding + avoid hard height on mobile
        style={{
          backgroundImage: `url('/assets/HeroBackground.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* <img
          src="/assets/BoxRight.png"
          alt="BoxRight"
          className="absolute top-[107px] xl:right-[166px] z-0"
        /> */}
        <div
          // className="text-center w-[1040px] h-[370px] max-xs:w-[375px] align-middle"
          // style={{
          //   backgroundImage: `url('/assets/cyrcls.png')`,
          //   backgroundSize: 'cover',
          //   backgroundPosition: 'center',
          // }}
        >
          <div className="mx-auto px-6">
            <div className="mb-5" data-sfcontainer="Breadcrumb">
              {breadcrumbs.map((y) =>
                RenderWidgetService.createComponent(y.model, props.requestContext),
              )}
            </div>
          </div>

          {title && (
            <Title>
              <p className="md:text-[40px] font-bold mb-3 text-white tracking-tight md:leading-[52px] xs:text-2xl xs:leading-8 w-auto text-center">
                {title}
              </p>
            </Title>
          )}
          {subtitle && (
            <Description
              html={subtitle}
              className="text-white md:w-[485px] mx-auto text-center md:font-semibold md:leading-7 xs:font-normal xs:leading-5 mb-1 xs:w-[295px]"
            />
          )}
          {description && (
            <Description
              html={description}
              className="text-white md:w-[485px] mx-auto text-center md:leading-7 xs:leading-5 xs:w-[295px]"
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      {...attrs}
      className="md:relative md:overflow-hidden text-white rounded-[32px] md:h-[700px] xs:flex xs:flex-col xs:h-[752px]"
      style={{
        backgroundImage: `url('/assets/HeroBackground.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* decorative glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-cyan-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className=" xs:hidden pointer-events-none md:absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-400/30 blur-3xl"
      />

      <div className="relative md:grid md:grid-cols-2 md:gap-16 md:max-w-7xl md:px-20 md:py-24  xs:flex xs:flex-col xs:px-8 xs:py-20 ">
        <div className="flex flex-col items-start justify-center md:mb-44 md:fadeLeftHero xs:mb-4">
          {eyebrow && (
            <Eyebrow className="md:font-medium xs:font-light md:text-lg xs:text-md leading-6" color="white">
              {eyebrow}
            </Eyebrow>
          )}

          {title && (
            <Title
              color="text-white"
              className="mt-1 mx-0 md:max-w-[500px] xs:w-[80%] font-bold md:text-[48px] xs:text-[2rem] md:leading-[90px] md:tracking-[-0.02em] xs:tracking-[-0.01em] mb-4"
            >
              {title}
            </Title>
          )}

          {description && <Description html={description} className="text-white mb-4 " />}

          {ctaText && (
            <div>
              <CTA
                variant="outline"
                colorText="text-white"
                fontWeight="font-semibold"
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

        <div className="relative md:h-[660px] md:w-[690px] xs:h-[330px] xs:w-[375px] xs:bottom-5  md:bottom-8 xs:right-12 fadeupHero">
          {heroImgUrl ? (
            <Image
              src={heroImgUrl}
              alt={bgAlt || 'Hero image'}
              fill
              className="h-[660px] w-[690px] object-contain"
              quality={90}
              priority
            />
          ) : (
            <div className="aspect-[4/3] w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl" />
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
