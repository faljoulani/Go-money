import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { FaqEntity } from './faq.entity';

const FAQ_CATEGORY_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.FAQ.FAQ';      
const FAQ_ITEM_TYPE     = 'Telerik.Sitefinity.DynamicTypes.Model.FAQ.FaqItem';  

type Category = { Id: string; Title: string; Order?: number; Provider?: string; Icon?: any };
type FaqItem  = { Id: string; Question: string; Answer: string; Order?: number };


const firstOrSelf = (v: any) => Array.isArray(v) ? v[0] : v;
function getImageUrl(img: any): string | undefined {
  if (!img) return;
  return (
    img.Url ||
    img.MediaUrl ||
    img.ThumbnailUrl ||
    img.EmbedUrl ||
    img.Urls?.Default ||
    img.Urls?.DefaultUrl
  );
}

export async function FaqSection(props: WidgetContext<FaqEntity>) {
  const attrs = htmlAttributes(props);


  let selection = props.model?.Properties?.Categories ?? (props.model?.Properties as any)?.Categories;
  if (typeof selection === 'string') {
    try { selection = JSON.parse(selection); } catch { selection = undefined; }
  }

  
  let categories: Category[] = [];
  if (selection?.Content?.length) {
    try {
      const res = await RestClientForContext.getItems(selection, {
        type: FAQ_CATEGORY_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          'Id',
          'Title',
          'Order',
          'Provider',
          
          'Icon($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)'
        ],
      });
      categories = (res?.Items ?? []).sort((a: any, b: any) => (a.Order ?? 0) - (b.Order ?? 0));
    } catch (e) {
      console.error(' Error fetching FAQ categories:', e);
    }
  }

  if (!categories.length) {
    return props.requestContext.isEdit
      ? <section {...attrs} className="FaqSection">Select FAQ categories.</section>
      : null;
  }

  
  async function fetchItemsForCategory(cat: Category): Promise<FaqItem[]> {
    const selectionForItems = {
      Content: [{
        Type: FAQ_ITEM_TYPE,
        Variations: [
          { Source: cat.Provider, Filter: { Key: 'FAQ.Id', Value: cat.Id } }
        ],
      }],
    };

    try {
      const res = await RestClientForContext.getItems(selectionForItems, {
        type: FAQ_ITEM_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id', 'Question', 'Answer', 'Order'],
      });
      const items = (res?.Items ?? []) as FaqItem[];
      return items.sort((a: any, b: any) => (a.Order ?? 0) - (b.Order ?? 0));
    } catch (e) {
      console.error(` Error fetching items for category ${cat.Title}:`, e);
      return [];
    }
  }

  const itemGroups = await Promise.all(categories.map(async (cat) => ({
    category: cat,
    items: await fetchItemsForCategory(cat),
  })));

  const hasAnyItems = itemGroups.some(g => g.items.length > 0);
  if (!hasAnyItems && props.requestContext.isEdit) {
    return <section {...attrs} className="FaqSection">No FAQ items found for selected categories.</section>;
  }
  if (!hasAnyItems) return null;

 
  return (
    <section {...attrs} className="FaqSection">
      {itemGroups.map((group, gi) => {
        const iconField = firstOrSelf(group.category.Icon);
        const iconUrl   = getImageUrl(iconField);
        const iconAlt   = iconField?.AlternativeText || iconField?.Title || group.category.Title;

        return (
          <div className="FaqCategory" key={group.category.Id || gi}>
            {iconUrl && (
              <img
                src={iconUrl}
                alt={iconAlt}
                className="FaqCategory-icon"
                style={{ width: 56, height: 56, objectFit: 'cover', marginBottom: 8 }}
              />
            )}

            <h3 className="FaqCategory-title">{group.category.Title}</h3>

            <div className="FaqItems">
              {group.items.map((it, ii) => (
                <div className="FaqItem" key={it.Id || ii}>
                  <strong className="FaqItem-question">{it.Question}</strong>
                  <div className="FaqItem-answer" dangerouslySetInnerHTML={{ __html: it.Answer }} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default FaqSection;

