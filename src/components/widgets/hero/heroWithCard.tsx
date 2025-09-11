import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { HeroEntity } from './hero.entity';
import Image from 'next/image';
import CEOMessageCard from '../cards/ceoMessageCard';

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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">{title}</h1>
        )}
        {description && <p className="mt-6 text-lg sm:text-xl text-white/85">{description}</p>}
        <div className="relative -mt-16 md:-mt-20">
          <div
            className="mx-auto max-w-7xl rounded-2xl bg-white shadow-xl ring-1 ring-black/5
                     px-6 md:px-10 py-8 md:py-10"
          >
            <div className="grid gap-8 md:gap-10 md:grid-cols-2 items-start">
              <CEOMessageCard {...props} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

