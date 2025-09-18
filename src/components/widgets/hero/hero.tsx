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
  const description = item.Description || '';
  const ctaText = item.CtaText || 'Learn more';
  const ctaUrl = linkToHref(item.CtaUrl);

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
        className="relative overflow-hidden h-[550px] text-white flex items-center justify-center flex-col rounded-2xl"
        style={{
          backgroundImage: `url('/assets/HeroBackground.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          alignItems: 'buttom'
        }}
      >
        <img
          src="/assets/BoxRight.png"
          alt="BoxRight"
          className="absolute top-[40px] right-[40px]"
        />
        <img
          src="/assets/BoxLeft.png"
          alt="BoxLeft"
          className="absolute top-1/2 left-[40px] -translate-y-1/2"
        />
        <div
          className="max-w-4xl px-6 pb-20 text-center"
          style={{
            backgroundImage: `url('/assets/cyrcls.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="mx-auto max-w-7xl px-6 pt-8">
            <div className="mb-6" data-sfcontainer="Breadcrumb">
              {breadcrumbs.map((y) =>
                RenderWidgetService.createComponent(y.model, props.requestContext),
              )}
            </div>
          </div>
          {title && <h1 className="text-4xl font-extrabold leading-tight">{title}</h1>}
          {description && <Description html={description} />}
        </div>
      </section>
    );
  }

  return (
    <section
      {...attrs}
      className="relative overflow-hidden text-white rounded-[32px] h-[700px]"
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
        className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-400/30 blur-3xl"
      />

      <div className="relative grid grid-cols-2 gap-16 max-w-7xl px-20 py-24 ">
        <div className="flex flex-col items-start justify-center gap-3 mb-44">
          {eyebrow && (
            <Eyebrow className="fadeLeftHero" color="white">
              {eyebrow}
            </Eyebrow>
          )}

          {title && (
            <Title
              color="text-white"
              className="mt-1 mx-0 max-w-[500px] font-bold text-[60px] leading-[80px] tracking-[-0.02em] fadeLeftHero"
            >
              {title}
            </Title>
          )}

          {description && (
            <Description html={description} className="text-white font-extralight fadeLeftHero" />
          )}

          {ctaText && (
            <div>
              <CTA
                variant="outline"
                colorText="text-white"
                fontText="font-lufga"
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

        <div className="relative h-[660px] w-[690px] bottom-8 fadeupHero">
          {heroImgUrl ? (
            <Image
              src={heroImgUrl}
              alt={bgAlt || 'Hero image'}
              fill
              className="object-contain"
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
