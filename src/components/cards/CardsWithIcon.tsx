import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { CardSectionEntity } from './card-section.entity';

const CARD_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card';
const CARD_LIST_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Cards';

const firstOrSelf = (f: any) => Array.isArray(f) ? f[0] : f;
const parseLink = (lf: any): string | undefined => {
  if (!lf) return;
  if (typeof lf === 'string') {
    try {
      const p = JSON.parse(lf);
      return p?.[0]?.href || p?.[0]?.Href;
    } catch {
      return lf;
    }
  }
  if (Array.isArray(lf)) return lf[0]?.href || lf[0]?.Href;
  return lf.href || lf.Href || lf;
};
const getImageUrl = (img: any): string | undefined =>
  img?.Url || img?.MediaUrl || img?.ThumbnailUrl || img?.EmbedUrl || img?.Urls?.Default || img?.Urls?.DefaultUrl;

export async function CardsWithIcon(props: WidgetContext<CardSectionEntity>) {
  const attrs = htmlAttributes(props);

  // 🟢 جلب بيانات الـ Parent
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
    } catch (e) {
      console.error('❌ Error fetching parent card list:', e);
    }
  }

  // 🟢 جلب بيانات الأطفال
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
          'Id', 'Title', 'Description',
          'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)'
        ]
      });
      cards = (res?.Items ?? []).sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
    } catch (e) {
      console.error('❌ Error fetching child cards:', e);
    }
  }

  if (!cards.length && !cardList && props.requestContext.isEdit) {
    return <section {...attrs}>No data available</section>;
  }

  return (
    <section {...attrs} className="CardsWithIcon-section">
      <div className="CardsWithIcon-inner">
        {/* ✅ طباعة بيانات الـ Parent */}
        <div className="CardsWithIcon-header">
          {cardList?.Eyebrow && <span className="CardsWithIcon-eyebrow">{cardList.Eyebrow}</span>}
          {cardList?.Title && <h2 className="CardsWithIcon-title">{cardList.Title}</h2>}
          {cardList?.Description && (
            <div
              className="CardsWithIcon-description"
              dangerouslySetInnerHTML={{ __html: cardList.Description }}
            />
          )}
          {cardList?.CtaText && cardList?.CtaUrl && (
            <a href={parseLink(cardList.CtaUrl)} className="CardsWithIcon-cta">
              {cardList.CtaText}
            </a>
          )}
        </div>

        {/* ✅ طباعة بيانات الـ Cards */}
        <div className="CardsWithIcon-grid">
          {cards.map((item, i) => {
            const imgField = firstOrSelf(item.Image);
            const image = getImageUrl(imgField);
            const alt = imgField?.AlternativeText || imgField?.Title || item.Title;

            return (
              <div key={item.Id || i} className="CardsWithIcon-card">
                {image && <img src={image} alt={alt} className="CardsWithIcon-icon" />}
                <div className="CardsWithIcon-content">
                  {item.Title && <h3 className="CardsWithIcon-cardTitle">{item.Title}</h3>}
                  {item.Description && (
                    <div
                      className="CardsWithIcon-cardDesc"
                      dangerouslySetInnerHTML={{ __html: item.Description }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CardsWithIcon;
