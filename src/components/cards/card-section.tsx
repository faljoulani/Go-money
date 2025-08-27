import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { CardSectionEntity } from './card-section.entity';

export async function CardSection(props: WidgetContext<CardSectionEntity>) {
  const attrs = htmlAttributes(props);

  let selection = props.model?.Properties?.Cards ?? (props.model?.Properties as any)?.Cards;
  if (typeof selection === 'string') {
    try { selection = JSON.parse(selection); } catch { selection = undefined; }
  }

  let items: any[] = [];
  if (selection?.Content?.length) {
    try {
      const result = await RestClientForContext.getItems(selection, {
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
          'Order',
          'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)'
        ]
      });
      items = (result?.Items ?? []).sort((a: any, b: any) => (a.Order ?? 0) - (b.Order ?? 0));
    } catch (e) {
      console.error('❌ Error fetching cards:', e);
    }
  }

  if (!items.length) {
    return props.requestContext.isEdit ? (
      <section {...attrs} className="CardSection">Select Card items.</section>
    ) : null;
  }

  const firstOrSelf = (f: any) => Array.isArray(f) ? f[0] : f;
  const parseLink = (lf: any): string | undefined => {
    if (!lf) return;
    if (typeof lf === 'string') {
      try { const p = JSON.parse(lf); return p?.[0]?.href || p?.[0]?.Href; } catch { return lf; }
    }
    if (Array.isArray(lf)) return lf[0]?.href || lf[0]?.Href;
    return lf.href || lf.Href || lf;
  };

  return (
    <section {...attrs} className="CardSection">
      <div className="CardGrid">
        {items.map((item: any, i: number) => {
          const imgField = firstOrSelf(item.Image);
          const image =
            imgField?.Url || imgField?.MediaUrl || imgField?.ThumbnailUrl ||
            imgField?.EmbedUrl || imgField?.Urls?.Default || imgField?.Urls?.DefaultUrl;
          const alt = imgField?.AlternativeText || imgField?.Title || item.Title;
          const link = parseLink(item.CtaUrl);

          return (
            <div key={item.Id || i} className="Card">
              {image && <img src={image} alt={alt} className="Card-image" />}
              <div className="Card-content">
                {item.Eyebrow && <span className="Card-eyebrow">{item.Eyebrow}</span>}
                {item.Title && <h3 className="Card-title">{item.Title}</h3>}
                {item.Description && <p className="Card-description">{item.Description}</p>}
                {link && <a href={link} className="Card-link">{item.CtaText || "Let's Go →"}</a>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CardSection;
 