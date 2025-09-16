import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { HeroEntity } from './hero.entity';
import Image from 'next/image';
import { resolveSitefinitySelection } from '../../../utils/utils';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';
import Eyebrow from '../../atoms/eyebrow/eyebrow';

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

  let selection = resolveSitefinitySelection(
    props.model?.Properties?.Hero ?? (props.model?.Properties as any)?.Hero,
  );

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
          {description && <Description html={description} />}
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
        <div className="flex flex-col gap-3 mb-44">
          {eyebrow && (
            <Eyebrow className='fadeLeftHero' color="white" align="left">
              {eyebrow}
            </Eyebrow>
          )}
          {title && (
            <Title
              align="left"
              color="text-white"
              className="
                mt-1 mx-0 max-w-[400px]
                font-bold
                text-[48px]
                leading-[100%]
                tracking-[-0.02em] fadeLeftHero
              "
            >
              {title}
            </Title>
          )}
          {description && (
            <Description align="left" html={description} className="text-white font-extralight fadeLeftHero" />
          )}

          {ctaText && (
            <div>
              <CTA
                href={(ctaUrl || '').trim() || '#'}
                textColor="text-white"
                borderColor="border-white"
                bgColor="transparent"
                variant="outline"
                icon="slot"
                className="rounded-[20px] px-6 py-[18px] border opacity-100 fadeLeftHero"
                align="left"
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
