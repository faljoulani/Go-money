import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { FooterEntity } from './Footer.entity';

const FOOTER_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.Footer.Footer';

export async function Footer(props: WidgetContext<FooterEntity>) {
  const attrs = htmlAttributes(props);

  // read designer selection
  let selection = props.model?.Properties?.Footer ?? (props.model?.Properties as any)?.Footer;
  if (typeof selection === 'string') {
    try { selection = JSON.parse(selection); } catch { selection = undefined; }
  }

  let item: any;
  if (selection?.Content?.length) {
    try {
      item = await RestClientForContext.getItem(selection, {
        type: FOOTER_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          // Root fields
          'Id',
          'Title',
          'UrlName',
          'Description',
          'SubTitle',
          'CopyrightText',
          'ExtraNote',

          // Footer logo (single or multiple)
          'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)',

          // Certifications (Logo as media)
          'CertificationLinks($select=Id,Title,description,Order,' +
            'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',

          // Navigation pages with URL fields
          'FooterNavigation($select=Id,SectionTitle,Order,' +
            'Pages($select=Id,Title,UrlName,ViewUrl,RelativeUrlPath,HasChildren))',

          // Social links (✅ Icon is the media field)
          'SocialLinks($select=Id,Title,Url,Order,' +
            'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
        ],
      } as any);
    } catch (e) {
      console.error('Error fetching footer:', e);
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return <footer {...attrs} className="Footer-widget">Select a Footer item.</footer>;
    }
    return null;
  }

  // --- helpers ---
  // Accepts: object | array | null; returns a single normalized media or null
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

  // Normalize shape for React
  const view = {
    Id: item.Id,
    Title: item.Title,
    UrlName: item.UrlName,
    Description: item.Description,
    SubTitle: item.SubTitle,
    CopyrightText: item.CopyrightText,
    ExtraNote: item.ExtraNote,

    // Footer logo (array-safe)
    Logo: pickOneMedia(item.Logo),

    CertificationLinks: sortByOrder(item.CertificationLinks).map((c: any) => ({
      Id: c.Id,
      Title: c.Title,
      Description: c.description,
      Order: c.Order ?? 0,
      Logo: pickOneMedia(c.Logo),   // array-safe
    })),

    FooterNavigation: sortByOrder(item.FooterNavigation).map((g: any) => ({
      Id: g.Id,
      SectionTitle: g.SectionTitle,
      Order: g.Order ?? 0,
      Pages: (g.Pages ?? []).map((p: any) => ({
        Id: p.Id,
        Title: p.Title,
        UrlName: p.UrlName,
        ViewUrl: p.ViewUrl,
        RelativeUrlPath: p.RelativeUrlPath,
        HasChildren: p.HasChildren,
      })),
    })),

    SocialLinks: sortByOrder(item.SocialLinks).map((s: any) => ({
      Id: s.Id,
      Title: s.Title,
      Url: s.Url,
      Order: s.Order ?? 0,
      Logo: pickOneMedia(s.Logo),   // ✅ array-safe, correct field
    })),
  };

  return (
    <footer {...attrs} className="Footer-debug">
      <h2>Footer Debug</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#f9f9f9', padding: 10 }}>
        {JSON.stringify(view, null, 2)}
      </pre>
    </footer>
  );
}

export default Footer;
