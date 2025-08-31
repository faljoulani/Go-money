import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { CardSectionEntity } from './card-section.entity';

const CARD_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card';
const CARD_LIST_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Cards';

const firstOrSelf = (f: any) => Array.isArray(f) ? f[0] : f;
const parseLink = (lf: any): string | undefined => {
  if (!lf) return;
  if (typeof lf === 'string') {
    try { const p = JSON.parse(lf); return p?.[0]?.href || p?.[0]?.Href; } catch { return lf; }
  }
  if (Array.isArray(lf)) return lf[0]?.href || lf[0]?.Href;
  return lf.href || lf.Href || lf;
};
const getImageUrl = (img: any): string | undefined =>
  img?.Url || img?.MediaUrl || img?.ThumbnailUrl || img?.EmbedUrl || img?.Urls?.Default || img?.Urls?.DefaultUrl;

export async function CardSection(props: WidgetContext<CardSectionEntity>) {
  const attrs = htmlAttributes(props);

  const parentSelection = props.model?.Properties?.CardListData;
  let cardList: any = undefined;

  if (parentSelection?.Content?.length) {
    try {
      const res = await RestClientForContext.getItems(parentSelection, {
        type: CARD_LIST_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id', 'Title', 'Description', 'CtaText', 'CtaUrl','Eyebrow',
          'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)'],
      });
      cardList = res?.Items?.[0];
      console.log(' Card List (Parent):', cardList);
    } catch (e) {
      console.error(' Error fetching parent Card List:', e);
    }
  }

  let cardSelection = props.model?.Properties?.Cards;
  if (typeof cardSelection === 'string') {
    try { cardSelection = JSON.parse(cardSelection); } catch { cardSelection = undefined; }
  }

  let cards: any[] = [];
  if (cardSelection?.Content?.length) {
    try {
      const res = await RestClientForContext.getItems(cardSelection, {
        type: CARD_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          'Id', 'Title', 'Description', 'Eyebrow', 'CtaText', 'CtaUrl', 'Order',
          'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)'
        ]
      });
      cards = (res?.Items ?? []).sort((a: any, b: any) => (a.Order ?? 0) - (b.Order ?? 0));
      console.log(' Cards (Child):', cards);
    } catch (e) {
      console.error(' Error fetching cards:', e);
    }
  }

  if (!cards.length && !cardList && props.requestContext.isEdit) {
    return <section {...attrs}>No data available</section>;
  }

  return (
  <section {...attrs} className="CardSection">
    
    {cardList?.Title && <h2 className="CardSection-title">{cardList.Title}</h2>}
    {cardList?.Description && (
      <div
        className="CardSection-description"
        dangerouslySetInnerHTML={{ __html: cardList.Description }}
      />
    )}

 {cardList?.MoreText && cardList?.MoreUrl && (
  <a href={parseLink(cardList.MoreUrl)} className="CardSection-moreLink">
    {cardList.MoreText}
  </a>
)}

    <div className="CardGrid">
      {cards.map((item: any, i: number) => {
        const imgField = firstOrSelf(item.Image);
        const image = getImageUrl(imgField);
        const alt = imgField?.AlternativeText || imgField?.Title || item.Title;
        const link = parseLink(item.CtaUrl);

        return (
          <div key={item.Id || i} className="Card">
            {image && <img src={image} alt={alt} className="Card-image" />}
            <div className="Card-content">
              {item.Eyebrow && <span className="Card-eyebrow">{item.Eyebrow}</span>}
              {item.Title && <h3 className="Card-title">{item.Title}</h3>}
              {item.Description && (
                <div
                  className="Card-description"
                  dangerouslySetInnerHTML={{ __html: item.Description }}
                />
              )}
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
