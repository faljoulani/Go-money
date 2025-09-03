import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { FaqSectionEntity } from './faq-section.entity';

const FAQ_ROOT_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.FAQs.FAQS';
const FAQ_CATEGORY_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.FAQs.FaqCategory';

export async function FaqSection(props: WidgetContext<FaqSectionEntity>) {
  const attrs = htmlAttributes(props);
  const model = props.model?.Properties;
  const viewName = model?.ViewName || 'Default';

  const parseContent = (c: any) =>
    typeof c === 'string' ? JSON.parse(c) : c;

  let faqRoot = parseContent(model?.FaqRoot);
  let selectedCategories = parseContent(model?.FaqCategories);

  let rootData: any = undefined;
  let categories: any[] = [];

  try {
    if (faqRoot?.Content?.length) {
      const rootRes = await RestClientForContext.getItems(faqRoot, {
        type: FAQ_ROOT_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id', 'Title', 'Description']
      });
      rootData = rootRes?.Items?.[0];
    }

    if (selectedCategories?.Content?.length) {
      const catRes = await RestClientForContext.getItems(selectedCategories, {
        type: FAQ_CATEGORY_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id', 'Title', 'Order']
      });
      categories = (catRes?.Items ?? []).sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
    }

  } catch (e) {
    console.error('Error loading FAQ data:', e);
    return <section {...attrs}>Error loading data</section>;
  }

  if (!categories.length && props.requestContext.isEdit) {
    return <section {...attrs}>No Category</section>;
  }

  return (
    <section {...attrs} className={`FaqSection FaqSection-${viewName}`}>
      {rootData?.Title && <h2 className="FaqSection-title">{rootData.Title}</h2>}
      {rootData?.Description && (
        <div
          className="FaqSection-description"
          dangerouslySetInnerHTML={{ __html: rootData.Description }}
        />
      )}

      <div className="FaqCategories">
        {categories.map((cat) => (
          <div key={cat.Id} className="FaqCategory">
            <h3 className="FaqCategory-title">{cat.Title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FaqSection;
