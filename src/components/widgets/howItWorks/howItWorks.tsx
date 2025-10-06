import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { HowItWorkEntity } from './howItWorks.entity';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { HowItWorksSimple } from './howItWorksSimple';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import { linkToHref } from '../../../utils/utils';

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

  let rawCtaUrl = view.CTAExternalUrl;

  try {
    if (typeof rawCtaUrl === 'string') {
      rawCtaUrl = JSON.parse(rawCtaUrl);
    }
  } catch {
    // If parsing fails, leave it as-is
  }

  const CTAExternalUrl = linkToHref(rawCtaUrl);
  const phoneSrc = mediaSrc(view.PhoneMockup) ?? '';
  const phoneAlt = view.PhoneMockup?.AlternativeText || view.PhoneMockup?.Title || 'Phone preview';

  if (selectedView === 'Simple') {
    return <HowItWorksSimple {...props} />;
  }
  return (
    <section {...attrs} className="relative mx-4 md:mx-20">
      {/* Top headline block */}
      <div className="flex flex-col items-center text-center md:gap-1 md:fadeupText">
        {view.SubTitle && <Eyebrow color="text-default">{view.SubTitle}</Eyebrow>}
        {view.Title && (
          <Title
            color="text-black"
            className="
              md:text-[40px]
              xs:text-[1.6rem]
              font-bold     
              tracking-[-0.02em]
              md:leading-[75px]
            "
          >
            {view.Title}
          </Title>
        )}
        {view.HeaderText && <Description>{view.HeaderText}</Description>}
      </div>

      {/* Rings background + sticky phone */}
      <div
        className="relative md:mt-10 md:h-[1390px] xs:mt-36 xs:h-[1400px] flex flex-col justify-center items-center"
        style={{
          backgroundImage: 'var(--howitworks-bg)',
          backgroundSize: '1380px',
          backgroundPosition: '50% 70%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="pointer-events-none md:h-[70%]  xs:h-[100%] absolute inset-0 z-40 md:mt-36 md:left-[170px] xs:left-[6.5rem] ">
          <div className=" translatePhone  sticky  flex justify-center">
            <img src={phoneSrc} alt={phoneAlt} className="h-[565px] w-[440px]" />
          </div>
        </div>
        <div className="h-[140vh]" />

        {/* Navy pocket section */}
        <section className="relative w-full">
          <div className="flex flex-col items-center relative rounded-[30px] overflow-clip bg-black md:h-[725px] xs:h-[1330px]">
            {/* semi-transparent curved overlay to keep top crop and blend */}
            <img
              src="/assets/blackCurve.webp"
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
              className="pointer-events-none  xs:w-full xs:h-[675px] xs:object-fit  md:object-cover md:w-full md:h-[56%] xl:h-[500px] select-none absolute left-0 z-50"
            />
            <img
              src="/assets/Vector.png"
              alt=""
              className="absolute object-cover z-[60] bottom-0 left-0"
            />

            <div className="relative z-[70] mx-auto max-w-6xl px-6 xs:pt-24 xs:pb-20 md:pb-28 md:pt-32 ">
              {view.IntroLead && (
                <h2 className="text-center text-white font-light md:pt-10 xs:pt-28 xs:pb-5 xs:text-[22px] md:text-[28px] md:fadeupText">
                  {view.IntroLead}
                </h2>
              )}

              <div className="md:mt-12  grid gap-8 xs:grid-cols-1 md:grid-cols-3 md:fadeup">
                {view.Steps.map((s, i) => {
                  const logoSrc = mediaSrc(s.Logo);
                  const logoAlt = s.Logo?.AlternativeText || s.Logo?.Title || '';
                  const stepNo = String(s.StepNumber ?? i + 1).padStart(2, '0');

                  return (
                    <div
                      key={s.Id || `${s.Title}-${i}`}
                      className="relative rounded-[28px] p-10 text-white
                                 ring-1 ring-white/15 bg-white/[0.06] backdrop-blur
                                 border-t border-l border-gradient-to-br from-[#FFFFFF00] to-[#FFFFFF]
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

                      <h3 className="text-center text-2xl">{s.Title}</h3>
                      {s.Description && (
                        <p className="mt-3 text-center text-[#E0E0E0] mb-4 text-base">
                          {s.Description}
                        </p>
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
                <div className="mt-12 flex justify-center fadeupButton">
                  <a
                    href={CTAExternalUrl || view.CTAInternalPage || '#'}
                    className="group inline-flex items-center gap-2 rounded-[20px] px-6 py-3
                               text-[#F7FAFC] font-medium w-[250px] h-14 text-center justify-center
                               shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]
                               backdrop-blur-[2px] hover:bg-white/10 transition"
                  >
                    <span>{view.CTALabel}</span>
                    <img src="/icons/Icon's-Slot.svg" alt="Icon's-Slot" className="cta-arrow" />
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

