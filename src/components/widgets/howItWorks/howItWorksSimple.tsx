import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { HowItWorkEntity } from './howItWorks.entity';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';

import NavyBackground from './NavyBackground.webp';

const SECTION_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.HowItWorks.Howitworkssection';

export async function HowItWorksSimple(props: WidgetContext<HowItWorkEntity>) {
  const attrs = htmlAttributes(props);

  let selection = props.model?.Properties?.HowItWork ?? (props.model?.Properties as any)?.HowItWork;
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

  return (
    <section {...attrs} className="relative xs:flex xs:flex-col ">
      {/* Top headline block */}
      <div className="mx-auto max-w-4xl text-center px-6">
        {view.SubTitle && (
          <p className="text-sm  uppercase tracking-0 text-primary">
            {view.SubTitle}
          </p>
        )}
        {view.Title && (
          <h1 className="mt-3 md:text-[48px]  xs:text-[24px] font-bold tracking-[-0.02em] text-primary">
            {view.Title}
          </h1>
        )}
        {view.HeaderText && (
          <p className="mt-3 text-base text-default max-w-[750px] mx-auto justify-center">{view.HeaderText}</p>
        )}
      </div>

      <section className="relative mx-auto w-full mb-10 xs:px-4">
        <div
          className="flex flex-col items-center relative rounded-3xl mt-10"
          style={{
            backgroundImage: "url('/assets/NavyBackground.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        
          }}
        >
          {/* Content */}
          <div className="relative z-[70] md:p-16 xs:p-4">
            {view.IntroLead && (
              <h2 className="text-center text-white md:text-[36px] xs:text-[1.3rem]">
                {view.IntroLead}
              </h2>
            )}

            {/* Steps */}
            <div className="md:mt-12 xs:mt-4 grid md:gap-8 xs:gap-12 md:grid-cols-3 xs:grid-cols-1">
              {view.Steps.map((s, i) => {
                const logoSrc = mediaSrc(s.Logo);
                const logoAlt = s.Logo?.AlternativeText || s.Logo?.Title || '';
                const stepNo = String(s.StepNumber ?? i + 1).padStart(2, '0');

                return (
                  <div
                    key={s.Id || `${s.Title}-${i}`}
                    className="relative rounded-[32px] md:p-12 xs:p-8 rtl:p-14 text-white 
                                 ring-1 ring-white/15 bg-white/[0.06] backdrop-blur
                                 before:content-[''] before:absolute before:inset-0 before:rounded-[28px]
                                 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_40%)]
                                 before:pointer-events-none"
                  >
                    <div className="mx-auto mb-6 grid h-16 w-16 place-items-center">
                      {logoSrc ? (
                        <img src={logoSrc} alt={logoAlt} className="h-16 w-16" />
                      ) : (
                        <span className="text-2xl" aria-hidden>
                          🖼️
                        </span>
                      )}
                    </div>

                    <h3 className="text-center md:text-2xl xs:text-[1.4rem]">{s.Title}</h3>
                    {s.Description && (
                      <p className="mt-3 text-center text-[16px] text-[#E0E0E0] mb-4">{s.Description}</p>
                    )}

                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 grid h-16 w-16 place-items-center rounded-full bg-emerald-300 text-primary text-[16px] ring-1 ring-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                      {stepNo}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            {view.CTALabel && (
              <div className="md:mt-[68px]  xs:mt-[42px] flex justify-center ">
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
                    className="cta-arrow size-4 translate-x-0 transition-transform group-hover:translate-x-0.5"
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
    </section>
  );
}

export default HowItWorksSimple;

