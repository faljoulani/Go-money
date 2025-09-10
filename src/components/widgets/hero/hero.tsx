import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { HeroEntity } from './hero.entity';
import Image from 'next/image';

import BreadCrumbCustomView from '../breadcrumb/breadcrumbCustom';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';

export async function Hero(props: WidgetContext<HeroEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';
  try {
    console.log('[Hero] Rendering view:', selectedView);
  } catch {}

  let selection = props.model?.Properties?.Hero ?? (props.model?.Properties as any)?.Hero;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  let item: any;
  if (selection?.Content?.length) {
    const id = selection?.ItemIdsOrdered?.[0]?.toString();
    const provider = selection?.Content?.[0]?.Variations?.[0]?.Source?.toString();
    try {
      item = await RestClient.getItem({
        id,
        provider,
        type: selection.Content[0].Type,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          'Id',
          'Title',
          'Description',
          'Eyebrow',
          'CtaText',
          'CtaUrl',
          'BackgroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Provider,Urls)',
        ],
      });
    } catch {
      /* ignore */
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="Hero-widget p-6 border border-dashed">
          Select a Hero item.
        </section>
      );
    }
    return null;
  }

  // Helpers
  const firstOrSelf = (field: any) => (Array.isArray(field) ? field[0] : field);
  const parseLink = (linkField: any): string | undefined => {
    if (!linkField) return;
    if (typeof linkField === 'string') {
      try {
        const parsed = JSON.parse(linkField);
        return parsed?.[0]?.href || parsed?.[0]?.Href;
      } catch {
        return linkField;
      }
    }
    if (Array.isArray(linkField)) return linkField[0]?.href || linkField[0]?.Href;
    return linkField.href || linkField.Href || linkField;
  };
  const pickUrl = (m: any): string | undefined =>
    m?.Url ||
    m?.MediaUrl ||
    m?.ThumbnailUrl ||
    m?.EmbedUrl ||
    m?.Urls?.Default ||
    m?.Urls?.DefaultUrl;

  const eyebrow = item.Eyebrow || '';
  const title = item.Title || '';
  const description = item.Description || '';
  const ctaText = item.CtaText || 'Learn more';
  const ctaUrl = parseLink(item.CtaUrl);

  let bgMedia = firstOrSelf(item.BackgroundImage);
  if (bgMedia && !pickUrl(bgMedia) && bgMedia.Id) {
    try {
      const full = await RestClient.getItem({
        type: 'Telerik.Sitefinity.Libraries.Model.Image',
        id: bgMedia.Id?.toString(),
        provider: bgMedia.Provider?.toString(),
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          'Id',
          'Url',
          'MediaUrl',
          'ThumbnailUrl',
          'EmbedUrl',
          'Title',
          'AlternativeText',
          'Urls',
        ],
      });
      bgMedia = { ...full, ...bgMedia };
    } catch (err) {
      console.error('Hero image fetch failed:', err);
    }
  }
  const bgUrl = pickUrl(bgMedia);
  const bgAlt = bgMedia?.AlternativeText || bgMedia?.Title || title;

  const toAbsolute = (u?: string) => {
    if (!u) return undefined;
    if (/^https?:\/\//i.test(u)) return u;
    const base =
      (props.requestContext as any)?.siteData?.SiteUrl ??
      (typeof window !== 'undefined' ? window.location.origin : undefined);
    try {
      return base ? new URL(u, base).toString() : u;
    } catch {
      return u;
    }
  };
  const heroImgUrl = toAbsolute(bgUrl);

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
        }}
      >
        <div className=" max-w-4xl px-6 pb-20 text-center">
          <div className="mx-auto max-w-7xl px-6 pt-8">
              <div className="mb-6" data-sfcontainer="Breadcrumb"></div>
            {/* <div className="mb-6">
              <BreadcrumbCustomView
                requestContext={props.requestContext}
                items={[]}
                widgetContext={props}
                attributes={{}}
              />
            </div> */}
          </div>
          {title && (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              {title}
            </h1>
          )}
          {description && <Description>{description}</Description>}
        </div>
      </section>
    );
  }

  // DEFAULT hero
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

      <div className="relative grid max-w-7xl grid-cols-1 items-center px-20 py-24 md:grid-cols-2 lg:gap-16">
        <div className='mb-24'>
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              {eyebrow}
            </p>
          )}
          {title && (
            <Title
              align="left"
              style={{
                maxWidth: '400px',
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: '1.25',
              }}
              className="mt-1 mx-0 sm:text-5xl lg:text-6xl"
            >
              {title}
            </Title>
          )}
          {description && (
            <Description
              align="left"
              style={{
                fontWeight: 300,
                fontSize: '16px',
                lineHeight: '100%',
                color: 'white',
              }}
              className="my-4"
            >
              {description}
            </Description>
          )}

          {ctaText && (
            <div className="mt-4 text-center flex felx-col">
              <CTA
                href={(ctaUrl || '').trim() || '#'}
                color="white"
                borderColor="white"
                variant="outline"
                width={248}
                height={56}
                icon="slot"
                className="rounded-[20px] px-6 py-[18px] border opacity-100"
              >
                {ctaText}
              </CTA>
            </div>
          )}
        </div>

        <div className="relative h-[660px] w-[690px] bottom-5">
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
