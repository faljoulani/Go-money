import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { HeroEntity } from './hero.entity';

export async function Hero(props: WidgetContext<HeroEntity>) {
  const attrs = htmlAttributes(props);
  console.log('Hero props', props);

  // 1) Read selection from widget model (Module Builder "Hero" selector)
  let selection = props.model?.Properties?.Hero ?? (props.model?.Properties as any)?.Hero;
  if (typeof selection === 'string') {
    try { selection = JSON.parse(selection); } catch { selection = undefined; }
  }

  // 2) Fetch the selected item with ONLY the fields we need
  let item: any;
  if (selection?.Content?.length) {
    try {
      item = await RestClientForContext.getItem(selection, {
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
          'BackgroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Provider,Urls)'
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
    m?.Url || m?.MediaUrl || m?.ThumbnailUrl || m?.EmbedUrl || m?.Urls?.Default || m?.Urls?.DefaultUrl;

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
      const imgSel = {
        ItemIdsOrdered: [bgMedia.Id],
        Content: [{
          Type: 'Telerik.Sitefinity.Libraries.Model.Image',
          Variations: [{ Source: bgMedia.Provider, Filter: { Key: 'Id', Value: bgMedia.Id } }],
        }],
      };
      const full = await RestClientForContext.getItem(imgSel, {
        type: 'Telerik.Sitefinity.Libraries.Model.Image',
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id','Url','MediaUrl','ThumbnailUrl','EmbedUrl','Title','AlternativeText','Urls'],
      });
      bgMedia = { ...full, ...bgMedia };
    } catch { }
  }
  const bgUrl = pickUrl(bgMedia);
  const bgAlt = bgMedia?.AlternativeText || bgMedia?.Title || title;

  // 7) Render — gradient + optional background image blended underneath
  //    Two-layer background: linear-gradient + image (if provided).
  const backgroundImage = bgUrl
    ? `linear-gradient(135deg, rgba(6,182,212,1) 0%, rgba(79,70,229,0.9) 60 %), url(${bgUrl})`
    : undefined;

  return (
    <section
      {...attrs}
      className="relative overflow-hidden text-white"
      style={backgroundImage ? { backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' } : undefined}
    >
      {/* If no image, fall back to the pure gradient classes */}
      {!bgUrl && (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-cyan-300/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700" />
        </>
      )}

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 lg:gap-16">
        {/* Left: copy from Sitefinity */}
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

          {description && (
            <p className="mt-6 max-w-lg text-white/85">{description}</p>
          )}
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

        {/* Right: device mock + floating cards (static for now) */}
        <div className="relative mx-auto w-[320px] sm:w-[360px] lg:w-[400px]" aria-label={bgAlt}>
          {/* floating glass info card */}
          <div className="absolute -left-46 top-30 z-10 w-60 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
            <p className="text-sm text-white/80">Micro-finance</p>
            <p className="mt-0.5 text-[11px] text-white/60">Application ID : 191715130</p>
            <div className="mt-4">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-xs text-white/80">Total Repayment</span>
                <span className="text-sm font-semibold">32,778.00$</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
              </div>
            </div>
          </div>

          {/* phone body */}
          <div className="relative h-[720px] rounded-[2.25rem] bg-black/70 p-2 shadow-2xl ring-3 ring-white/10">
            <div className="absolute left-1/2 top-1.5 h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-black" />
            <div className="rounded-[1.9rem] bg-white p-3 h-full display-flex gap-30 justify-between">
              <div className="rounded-xl bg-cyan-50 p-3">
                <div className="rounded-lg bg-cyan-100 p-3 text-center text-sm font-semibold text-cyan-900">
                  Ready to get started?
                  <div className="mt-1 text-xs font-normal text-cyan-700">Get up to SAR 50,000 in minutes</div>
                </div>
                <button className="mt-3 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                  Get Started Now
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ['1. Apply in Minutes', 'Simple application\nwith instant pre-approval.'],
                  ['2. Get Approved', 'Quick review and\napproval process.'],
                  ['3. Receive Funds', 'Transferred within\n24 hours.'],
                ].map(([t, b]) => (
                  <div key={t} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <p className="text-[10px] font-semibold text-slate-900">{t}</p>
                    <p className="mt-1 whitespace-pre-line text-[10px] text-slate-600">{b}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-5 gap-1 rounded-xl bg-slate-100 p-2 text-center text-[10px] text-slate-600">
                <div className="rounded-md bg-white py-1 font-medium text-slate-900">Home</div>
                <div className="rounded-md py-1">My Loans</div>
                <div className="rounded-md py-1">Calculator</div>
                <div className="rounded-md py-1">More</div>
                <div className="rounded-md py-1">Profile</div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 right-14 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-xl backdrop-blur-xl">
            <span aria-hidden>X</span> Sharia Compliant
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
