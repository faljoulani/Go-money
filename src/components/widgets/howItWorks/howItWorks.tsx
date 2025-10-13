import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { HowItWorkEntity } from './howItWorks.entity';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { HowItWorksSimple } from './howItWorksSimple';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import { linkToHref } from '../../../utils/utils';
import CTA from '../../atoms/cta/cta';

const SECTION_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.HowItWorks.Howitworkssection';

export async function HowItWork(props: WidgetContext<HowItWorkEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';

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
          'CTAURL',
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
  const phoneSrc = mediaSrc(view.PhoneMockup) ?? '';
  const phoneAlt = view.PhoneMockup?.AlternativeText || view.PhoneMockup?.Title || 'Phone preview';
  if (selectedView === 'Simple') {
    return <HowItWorksSimple {...props} />;
  }
  return (
    <section {...attrs} className="relative xs:mx-4 md:mx-28  xxl:mx-auto max-w-[1440px]">
      {/* Top headline block */}
      <div className="flex flex-col items-center text-center md:gap-1 md:fadeupText">
        {view.SubTitle && <Eyebrow color="text-primary" className="md:text-[18px] xs:text-[14px]">{view.SubTitle}</Eyebrow>}
        {view.Title && (
          <Title
            color="text-black"
            className="
              md:text-[40px]
              xs:text-[24px]
              font-bold     
              tracking-[-0.02em]
              md:leading-[75px]
              text-primary
            "
          >
            {view.Title}
          </Title>
        )}
        {view.HeaderText && <Description>{view.HeaderText}</Description>}
      </div>

      {/* Rings background + sticky phone */}
      <div
        className="relative md:mt-10 md:h-[1390px] xs:mt-24 xs:h-[1600px] flex flex-col justify-center items-center"
        style={{
          backgroundImage: 'var(--howitworks-bg)',
          backgroundSize: '1380px',
          backgroundPosition: '50% 70%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="pointer-events-none md:h-[70%]  xs:h-[100%] absolute inset-0 z-40 md:mt-20 md:left-[170px] xs:left-[27%] ">
          <div className=" translatePhone  sticky md:top-20 flex justify-center">
            <img src={phoneSrc} alt={phoneAlt} className="h-[565px] w-[440px]" />
          </div>
        </div>
        <div className="h-[140vh]" />

        {/* Navy pocket section */}
        <section className="relative w-full">
          <div className="flex flex-col items-center relative rounded-[30px] overflow-clip bg-black md:h-[725px] xs:h-[1200px]">
            {/* semi-transparent curved overlay to keep top crop and blend */}
            <img
              src="/assets/BlackCurve.webp"
              alt=""
              className="absolute inset-0 w-full xs:object-fill md:object-cover md:h-full xs:h-[100%] left-0 z-10  object-top"
            />
            <img
              src="/assets/transparentN.png"
              alt=""
              className="absolute  xs:h-[100%]  w-full xs:object-fill md:object-cover md:h-[100%] xl:h-[900px] left-0 z-50  "
            />
            {/* pocket lip */}

            <img
              src="/assets/pocketHQ.webp"
              alt=""
              aria-hidden
              className="pointer-events-none  xs:w-full xs:h-[675px] xs:object-fit  md:object-cover md:w-full md:h-[56%] xl:h-[500px] select-none absolute left-0 xs:top-3 z-50"
            />
            <img
              src="/assets/Vector.png"
              alt=""
              className="absolute object-cover z-[60] bottom-0 left-0"
            />

            <div className="relative z-[70] mx-auto max-w-6xl px-6 xs:pt-24 xs:pb-20 md:pb-28 md:pt-32 ">
              {view.IntroLead && (
                <h2 className="text-center text-white font-bold md:pt-10 xs:pt-28 xs:pb-5 xs:text-[22px] md:text-[28px] md:fadeupText">
                  {view.IntroLead}
                </h2>
              )}

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
                                 before:pointer-events-none md:h-[265px] xs:h-[220px]"
                  >
                    <div className="mx-auto md:mb-6  xs:mb-0 xs:-mt-8 grid h-16 w-16 place-items-center">
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

                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 grid h-12 w-12 place-items-center rounded-full bg-emerald-300 text-[#0B1C5A] text-sm font-bold  shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                        {stepNo}
                      </div>
                    </div>
                  );
                })}
              </div>
          
                    {view.CTALabel && (
              <div className="md:mt-[68px]  xs:mt-12 flex justify-center fadeupButton">
                <a
                  href={CTAExternalUrl || '#'}
                  className="group inline-flex items-center  rounded-[20px] md:px-6 py-4
                          text-white dark:text-[#A6EFD9] font-medium md:text-lg xs:text-base
                            border-2 dark:border-[#A6EFD9] hover:bg-white/10 xs:w-full
                          hover:dark:bg-[#A6EFD9] hover:dark:text-[#010663] transition xs:px-8 md:w-[275px] md:max-w-[325px]"
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
      </div>
    </section>
  );
}

export default HowItWork;

