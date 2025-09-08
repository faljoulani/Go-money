
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { HeroEntity } from './hero.entity';
import Image from 'next/image';
import heroBg from './HeroBackground.jpg';
import BreadCrumbCustomView from '../breadcrumb/breadcrumbCustom';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import BreadCrumbCustomView from '../breadcrumb/breadcrumbCustom';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

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

  // const isSimple = selectedView === 'Simple' || (!eyebrow && !ctaUrl && !heroImgUrl);
  const isSimple = selectedView === 'Simple';

  if (isSimple) {
    return (
      <section
        {...attrs}
        className="relative overflow-hidden h-[550px] text-white flex items-center justify-center flex-col"
        style={{
          backgroundImage: `url(${heroBg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className=" max-w-4xl px-6 pb-20 text-center">
          <div className="mx-auto max-w-7xl px-6 pt-8">
            <div className="mb-6" data-sfcontainer="Breadcrumb"></div>
          </div>
          {title && (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              {title}
            </h1>
          )}
          {description && <p className="mt-6 text-lg sm:text-xl text-white/85">{description}</p>}
        </div>
      </section>
    );
  }

  // const isSimple = selectedView === 'Simple' || (!eyebrow && !ctaUrl && !heroImgUrl);
  const isSimple = selectedView === 'Simple';

  if (isSimple) {
    return (
      <section
        {...attrs}
        className="relative overflow-hidden h-[550px] text-white flex items-center justify-center flex-col"
        style={{
          backgroundImage: `url(${heroBg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className=" max-w-4xl px-6 pb-20 text-center">
          <div className="mx-auto max-w-7xl px-6 pt-8">
            <div className="mb-6" data-sfcontainer="Breadcrumb"></div>
          </div>
          {title && (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              {title}
            </h1>
          )}
          {description && <p className="mt-6 text-lg sm:text-xl text-white/85">{description}</p>}
        </div>
      </section>
    );
  }

  // ---- decide which view to render ----
  const isSimple = !eyebrow && !ctaUrl && !heroImgUrl;

  if (isSimple) {
    return (
      <section
        {...attrs}
        className="relative overflow-hidden h-[550px] text-white flex items-center justify-center flex-col"
        style={{
          backgroundImage: `url(${heroBg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
    
  

        <div className=" max-w-4xl px-6 pb-20 text-center">
             <div className="mx-auto max-w-7xl px-6 pt-8">
          <div className="mb-6" data-sfcontainer="Breadcrumb">
          </div>
        </div>
          {title && (
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-6 text-lg sm:text-xl text-white/85">
              {description}
            </p>
          )}
        </div>
      </section>
    );
  }

  // DEFAULT hero 
  return (
    <section
      {...attrs}
      className="relative overflow-hidden text-white"
      style={{
        backgroundImage: `url(${heroBg.src})`,
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

          {ctaUrl && (
            <div className="mt-10">
              <a
                href={ctaUrl}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg ring-1 ring-white/20 transition hover:translate-y-[-1px] hover:shadow-xl"
              >
                {ctaText}
                <span aria-hidden>→</span>
              </a>
            </div>
          )}
        </div>

        <div className="relative h-[720px] w-[160%] animate-float">
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
