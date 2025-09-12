import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { HowItWorkEntity } from './howItWorks.entity';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { HowItWorksSimple } from './howItWorksSimple';
// import HowItWorksRings from './HowItWorksRings.png';
// import NavyBackground from './NavyBackground.webp';
// import pocketImg from './pocketHQ.webp';
// import transparentNavy from './transparentNavy.png';
// import Mobile from './Mobile.png';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

const SECTION_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.HowItWorks.Howitworkssection';

export async function HowItWork(props: WidgetContext<HowItWorkEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';
  // Read designer selection
  let selection = props.model?.Properties?.HowItWork ?? (props.model?.Properties as any)?.HowItWork;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  // Fetch selected section (only necessary fields)
  let item: any;
  if (selection?.Content?.length) {
    const id = selection?.ItemIdsOrdered?.[0]?.toString();
    const provider = selection?.Content?.[0]?.Variations?.[0]?.Source?.toString();
    try {
      item = await RestClient.getItem({
        id,
        provider,
        type: SECTION_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          'Id',
          'Title',
          'UrlName',
          'SubTitle',
          'HeaderText',
          'IntroLead',
          'IntroSubLead',
          'CTALabel',
          'CTAExternalUrl',
          'CTAInternalPage($select=Id,Title,DefaultUrl)',
          'PhoneMockup($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)',
          'Steps($select=Id,Title,Description,Order,StepNumber,IsVisible,' +
            'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
        ],
      });
    } catch (e) {
      console.error('Error fetching HowItWork section:', e);
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="HowItWork-widget">
          Select a “How it works” item.
        </section>
      );
    }
    return null;
  }

  // ---------- helpers ----------
  const first = (v: any) => (Array.isArray(v) ? v[0] : v) || null;

  const pickOneMedia = (val: any) => {
    const m = first(val);
    return m
      ? {
          Id: m.Id,
          Title: m.Title,
          AlternativeText: m.AlternativeText,
          Url: m.Url ?? m.MediaUrl,
          MediaUrl: m.MediaUrl,
          ThumbnailUrl: m.ThumbnailUrl,
          EmbedUrl: m.EmbedUrl,
          Urls: m.Urls,
          Provider: m.Provider,
        }
      : null;
  };

  const mediaSrc = (m?: any) =>
    m?.Urls?.Default || m?.Urls?.DefaultUrl || m?.MediaUrl || m?.Url || undefined;

  const sortByOrder = (arr: any[] = []) =>
    arr.slice().sort((a, b) => (a?.Order ?? 0) - (b?.Order ?? 0));

  // ---------- normalize for view ----------
  const view = {
    Id: item.Id,
    Title: item.Title,
    UrlName: item.UrlName,
    HeaderText: item.HeaderText,
    SubTitle: item.SubTitle,
    IntroLead: item.IntroLead,
    IntroSubLead: item.IntroSubLead,

    CTALabel: item.CTALabel,
    CTAExternalUrl: item.CTAExternalUrl,
    CTAInternalPage: item.CTAInternalPage?.DefaultUrl ?? null,

    PhoneMockup: pickOneMedia(item.PhoneMockup),

    Steps: sortByOrder(item.Steps).map((s: any) => ({
      Id: s.Id,
      Title: s.Title,
      Description: s.Description,
      Order: s.Order ?? 0,
      StepNumber: s.StepNumber ?? null,
      Logo: pickOneMedia(s.Logo),
      IsVisible: s.IsVisible ?? true,
    })),
  };

  const phoneSrc = mediaSrc(view.PhoneMockup) ?? '';
  const phoneAlt = view.PhoneMockup?.AlternativeText || view.PhoneMockup?.Title || 'Phone preview';

  // ---------- render ----------
  if (selectedView === 'Simple') {
    return <HowItWorksSimple {...props} />;
  }
  return (
    <section {...attrs} className="relative mx-20 bg-white">
      {/* Top headline block */}
      <div className="mx-auto max-w-3xl text-center px-6 mb-2">
        {view.SubTitle && <Eyebrow>{view.SubTitle}</Eyebrow>}
        {view.Title && <Title className="h-[59px] mt-3 mb-1">{view.Title}</Title>}
        {view.HeaderText && <Description>{view.HeaderText}</Description>}
      </div>

      {/* Rings background + sticky phone */}
      <div
        className="relative h-[1390px] flex flex-col justify-center items-center"
        style={{
          backgroundImage: `url('/assets/Shape.png')`,
          backgroundSize: '1380px',
          backgroundPosition: '50% 70%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="pointer-events-none h-[70%] absolute inset-0 z-40 mt-36 left-[170px]">
          <div className="sticky top-[12vh] flex justify-center">
            <img src={phoneSrc} alt={phoneAlt} />
          </div>
        </div>
        <div className="h-[120vh]" />

        {/* Navy pocket section */}
        <section className="relative w-full">
          <div className="flex flex-col items-center relative rounded-[30px] overflow-hidden bg-black h-[725px]">
            {/* semi-transparent curved overlay to keep top crop and blend */}
            <img
              src="/assets/transparentN.png"
              alt=""
              className="absolute inset-0 w-full h-[725px] left-0 z-40 object-cover object-top"
            />
            {/* pocket lip */}
            <img
              src="/assets/pocketHQ.webp"
              alt=""
              aria-hidden
              className="pointer-events-none select-none absolute w-[1400px] left-0 z-50"
            />
            <img
              src="/assets/Vector.png"
              alt=""
              className="absolute object-cover z-[60] bottom-0 left-0"
            />

            <div className="relative z-[70] mx-auto max-w-6xl px-6 pt-28 pb-28 md:pt-32 md:pb-32">
              {view.IntroLead && (
                <h2 className="text-center text-white font-light pt-10 text-[28px] md:text-[40px]">
                  {view.IntroLead}
                </h2>
              )}

              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {view.Steps.map((s, i) => {
                  const logoSrc = mediaSrc(s.Logo);
                  const logoAlt = s.Logo?.AlternativeText || s.Logo?.Title || '';
                  const stepNo = String(s.StepNumber ?? i + 1).padStart(2, '0');

                  return (
                    <div
                      key={s.Id || `${s.Title}-${i}`}
                      className="relative rounded-[28px] p-10 text-white
                                 ring-1 ring-white/15 bg-white/[0.06] backdrop-blur
                                 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_30px_80px_rgba(0,0,0,0.35)]
                                 before:content-[''] before:absolute before:inset-0 before:rounded-[28px]
                                 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_40%)]
                                 before:pointer-events-none"
                    >
                      <div className="mx-auto mb-6 grid h-12 w-12 place-items-center">
                        {logoSrc ? (
                          <img src={logoSrc} alt={logoAlt} className="h-12 w-12" loading="lazy" />
                        ) : (
                          <span className="text-2xl" aria-hidden></span>
                        )}
                      </div>

                      <h3 className="text-center text-2xl font-semibold">{s.Title}</h3>
                      {s.Description && (
                        <p className="mt-3 text-center text-white/75 leading-6">{s.Description}</p>
                      )}

                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 grid h-12 w-12 place-items-center rounded-full bg-emerald-300 text-[#0B1C5A] text-sm font-bold ring-1 ring-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                        {stepNo}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              {view.CTALabel && (
                <div className="mt-12 flex justify-center">
                  <a
                    href={view.CTAInternalPage || view.CTAExternalUrl || '#'}
                    className="group inline-flex items-center gap-2 rounded-full px-6 py-3
                               text-white/95 font-medium
                               shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]
                               backdrop-blur-[2px] hover:bg-white/10 transition"
                  >
                    <span>{view.CTALabel}</span>
                    <svg
                      viewBox="0 0 20 20"
                      className="size-4 translate-x-0 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M7 4l6 6-6 6M12 10H3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default HowItWork;

