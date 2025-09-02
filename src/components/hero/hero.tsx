import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { HeroEntity } from './hero.entity';
import Image from 'next/image';
import heroBg from './HeroBackground.jpg';

export async function Hero(props: WidgetContext<HeroEntity>) {
  const attrs = htmlAttributes(props);
  console.log('Hero props', props);

  // 1) Read selection from widget model (Module Builder "Hero" selector)
  let selection = props.model?.Properties?.Hero ?? (props.model?.Properties as any)?.Hero;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  // 2) Fetch the selected item with ONLY the fields we need
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
      console.log('Hero item', item);
    } catch {
      // ignore
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

  // 4) Helpers

  const firstOrSelf = (field: any) => (Array.isArray(field) ? field[0] : field);

  const parseLink = (linkField: any): string | undefined => {
    if (!linkField) return;
    if (typeof linkField === 'string') {
      try {
        const parsed = JSON.parse(linkField);
        return parsed?.[0]?.href || parsed?.[0]?.Href;
      } catch {
        return linkField; // already a plain URL
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

  // 5) Map fields from Module Builder
  const eyebrow = item.Eyebrow || '';
  const title = item.Title || '';
  const description = item.Description || '';
  const ctaText = item.CtaText || 'Learn more';
  const ctaUrl = parseLink(item.CtaUrl);

  // 6) Resolve BackgroundImage (handles when only Id/Provider is present)
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
      console.error('Hero failed:', err);
    }
  }
  const bgUrl = pickUrl(bgMedia);
  const bgAlt = bgMedia?.AlternativeText || bgMedia?.Title || title;

  // 7) Render — gradient + optional background image blended underneath
  //    Two-layer background: linear-gradient + image (if provided).
  const backgroundImage = bgUrl
    ? `linear-gradient(135deg, rgba(6,182,212,1) 0%, rgba(79,70,229,0.9) 60 %), url(${bgUrl})`
    : undefined;
  const toAbsolute = (u?: string) => {
    if (!u) return undefined;
    if (/^https?:\/\//i.test(u)) return u; // already absolute

    // Prefer Sitefinity site URL; otherwise use window origin (client-side)
    const base =
      (props.requestContext as any)?.siteData?.SiteUrl ??
      (typeof window !== 'undefined' ? window.location.origin : undefined);

    try {
      return base ? new URL(u, base).toString() : u; // keep relative if no base
    } catch {
      return u;
    }
  };

  const heroImgUrl = toAbsolute(bgUrl);
  return (
    <>
      <section
        {...attrs}
        className="relative overflow-hidden text-white"
        style={{
          backgroundImage: `url(${heroBg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        // style={backgroundImage ? { backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' } : undefined}
      >
        {/* If no image, fall back to the pure gradient classes */}

        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-cyan-300/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-400/30 blur-3xl"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700" /> */}

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 lg:gap-16">
          <div>
            {eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                {eyebrow}
              </p>
            )}

            {title && (
              <h1 className="mt-3 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>
            )}

            {description && <p className="mt-6 max-w-lg text-white/85">{description}</p>}
            <div className="mt-10">
              <a
                href={ctaUrl}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg ring-1 ring-white/20 transition hover:cursor-pointer hover:translate-y-[-1px] hover:shadow-xl"
              >
                {ctaText || 'Learn more'}
                <span aria-hidden>→</span>
              </a>
            </div>
            {/* {ctaUrl && (
            <div className="mt-10">
              <a
                href={ctaUrl}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg ring-1 ring-white/20 transition hover:translate-y-[-1px] hover:shadow-xl"
              >
                {ctaText || 'Learn more'}
                <span aria-hidden>→</span>
              </a>
            </div>
          )} */}
          </div>

          <div className=" relative h-[720px] w-[160%] animate-float">
            {heroImgUrl ? (
              <Image
                src={heroImgUrl!}
                alt="hero iamge"
                fill
                className="object-contain"
                quality={90}
                priority
              />
            ) : (
              <div className="aspect-[4/3] w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl" />
            )}{' '}
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
