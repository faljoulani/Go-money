import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { HowItWorkEntity } from './HowItWorks.entity';

const SECTION_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.HowItWorks.Howitworkssection';

export async function HowItWork(props: WidgetContext<HowItWorkEntity>) {
  const attrs = htmlAttributes(props);

  // read designer selection
  let selection = props.model?.Properties?.HowItWork ?? (props.model?.Properties as any)?.HowItWork;
  if (typeof selection === 'string') {
    try { selection = JSON.parse(selection); } catch { selection = undefined; }
  }

  let item: any;
  if (selection?.Content?.length) {
    try {
      item = await RestClientForContext.getItem(selection, {
        type: SECTION_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          // Root fields
          'Id',
          'Title',
          'UrlName',
          'SubTitle',
          'HeaderText',
          'IntroLead',
          'IntroSubLead',
          'CTALabel',
          'CTAExternalUrl',

          // Relations
          'CTAInternalPage($select=Id,Title,DefaultUrl)',
          'PhoneMockup($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)',

          // Steps (child items)
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
      return <section {...attrs} className="HowItWork-widget">Select a “How it works” item.</section>;
    }
    return null;
  }

  // --- helpers (same style as Footer) ---
  const pickOneMedia = (val: any) => {
    const m = Array.isArray(val) ? val[0] : val;
    if (!m) return null;
    return {
      Id: m.Id,
      Title: m.Title,
      Url: m.Url ?? m.MediaUrl,
      MediaUrl: m.MediaUrl,
      ThumbnailUrl: m.ThumbnailUrl,
      EmbedUrl: m.EmbedUrl,
      AlternativeText: m.AlternativeText,
      Urls: m.Urls,
      Provider: m.Provider,
    };
  };

  const sortByOrder = (arr: any[] = []) =>
    arr.slice().sort((a, b) => (a?.Order ?? 0) - (b?.Order ?? 0));

  // Normalize shape for React (debug object)
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

    Steps: sortByOrder(item.Steps)
      // keep parity with Footer (no filtering), but you can uncomment to hide invisible ones:
      // .filter((s: any) => s?.IsVisible !== false)
      .map((s: any) => ({
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
    <section {...attrs} className="HowItWork-debug">
      <h2>How It Works Debug</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#f9f9f9', padding: 10 }}>
        {JSON.stringify(view, null, 2)}
      </pre>
    </section>
  );
}

export default HowItWork;
