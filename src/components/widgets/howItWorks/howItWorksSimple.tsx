import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { HowItWorkEntity } from './howItWorks.entity';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { linkToHref } from '../../../utils/utils';
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

    if (!id) {
      console.warn('HowItWorkSimple: No item ID found in selection');
    } else {
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
            'CTAURL',
            'CTAInternalPage($select=Id,Title,DefaultUrl)',
            'PhoneMockup($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)',
            'Steps($select=Id,Title,Description,Order,StepNumber,IsVisible,' +
              'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
          ],
        });
      } catch (e) {
        console.error('Error fetching HowItWork section:', e);
        // Don't throw - allow page to render without this widget
      }
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
    CTAURL: item.CTAURL,
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
  let rawCtaUrl = view.CTAURL;

  try {
    if (typeof rawCtaUrl === 'string') {
      rawCtaUrl = JSON.parse(rawCtaUrl);
    }
  } catch {}
  const CTAExternalUrl = linkToHref(rawCtaUrl);
  return (
    <section {...attrs} className="relative xs:flex xs:flex-col ">
      {/* Top headline block */}
      <div className="mx-auto max-w-4xl text-center">
        {view.SubTitle && (
          <p className="xs:text-sm md:text-lg tracking-0 text-primary">{view.SubTitle}</p>
        )}
        {view.Title && (
          <h1
            className="mt-3 md:text-[48px] rtl:md:text-[40px] 
          xs:leading-9 md:leading-[63px] rtl:md:leading-[75px] xs:text-[24px] font-bold tracking-[-0.02em] text-primary"
          >
            {view.Title}
          </h1>
        )}
        {view.HeaderText && (
          <p className="mt-3 text-[16px] text-default max-w-[650px] mx-auto justify-center">
            {view.HeaderText}
          </p>
        )}
      </div>

      <section className="relative mx-auto w-full max-w-[1240px]">
        <div className="flex flex-col items-center relative rounded-3xl mt-10 bg-[linear-gradient(111.49deg,#000000_14.92%,#010552_46.49%,#0F148C_100.01%)] bg-cover bg-center dark:bg-[#131321] dark:bg-none">
          <img
            src="/assets/Vector.png"
            alt=""
            className="absolute object-cover bottom-0 left-0 z-0 pointer-events-none"
          />
          {/* Content */}
          <div className="relative z-[70] md:p-16 xs:p-6">
            {view.IntroLead && (
              <h2 className="text-center text-white md:text-[36px] md:font-normal xs:font-medium xs:text-lg">
                {view.IntroLead}
              </h2>
            )}

            {/* Steps */}
            <div className="md:mt-12 xs:mt-6 grid md:gap-8 xs:gap-12 md:grid-cols-3 xs:grid-cols-1">
              {view.Steps.map((s, i) => {
                const logoSrc = mediaSrc(s.Logo);
                const logoAlt = s.Logo?.AlternativeText || s.Logo?.Title || '';
                const stepNo = String(s.StepNumber ?? i + 1).padStart(2, '0');

                return (
                  <div
                    key={s.Id || `${s.Title}-${i}`}
                    className="relative md:rounded-[32px] xs:rounded-2xl md:p-12 xs:px-4 xs:pt-4 xs:pb-8 text-white 
                                 ring-1 ring-white/15 bg-white/[0.06] backdrop-blur 
                                 dark:border-none border-t border-l border-gradient-to-br from-[#FFFFFF00] to-[#FFFFFF]
                                 before:content-[''] before:absolute before:inset-0 before:md:rounded-[32px] before:xs:rounded-2xl
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

                    <h3 className="text-center md:text-2xl xs:text-xl">{s.Title}</h3>
                    {s.Description && (
                      <p className="mt-2 text-center text-[16px] text-[#E0E0E0] mb-4">
                        {s.Description}
                      </p>
                    )}

                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 grid h-16 w-16 place-items-center rounded-full bg-emerald-300 dark:bg-[#A6EFD9] text-[#010663] text-[16px]  shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                      {stepNo}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            {view.CTALabel && (
              <div className="md:mt-[68px] xs:mt-12 flex justify-center">
                <a
                  href={CTAExternalUrl || '#'}
                  className="group xs:max-w-[265px] inline-flex items-center gap-2 rounded-[20px] xs:px-8 md:px-6 py-3
                          text-white dark:text-[#A6EFD9] font-medium md:text-lg xs:text-base
                            border dark:border-[#A6EFD9] hover:bg-white/10 xs:w-full
                          hover:dark:bg-[#A6EFD9] hover:dark:text-[#010663] transition"
                >
                  <span className="mx-auto">{view.CTALabel}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cta-arrow size-6 translate-x-0 transition-transform "
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6" />
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

