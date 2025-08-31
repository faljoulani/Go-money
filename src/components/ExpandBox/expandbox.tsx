import {
  WidgetContext,
  htmlAttributes,
  RestClientForContext
} from '@progress/sitefinity-nextjs-sdk';
import { ExpandBoxEntity } from './expandbox.entity';

export async function ExpandBox(props: WidgetContext<ExpandBoxEntity>) {
  const attrs = htmlAttributes(props);

  let selection =
    props.model?.Properties?.ExpandBox ??
    (props.model?.Properties as any)?.ExpandBox;

  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  let item;
  if (selection?.Content?.length) {
    try {
      item = await RestClientForContext.getItem(selection, {
        type: selection.Content[0].Type,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id', 'Title', 'Description', 'Eyebrow', 'CtaText', 'CtaUrl',
            'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)'
        ] // ✅ أضف الحقول هنا
      });

      // ✅ Debug: اطبع البيانات الكاملة
      console.log("🧩 ExpandBox item:", item);
    } catch (error) {
      console.error('❌ Error fetching ExpandBox item:', error);
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="ExpandBox-widget">
          Select an ExpandBox item.
        </section>
      );
    }
    return null;
  }

  // ✅ جلب البيانات من العنصر
  const title = item.Title;
  const description = item.Description;
  const eyebrow = item.Eyebrow;
  const ctaText = item.CtaText;
  const ctaUrl = typeof item.CtaUrl === 'string' ? item.CtaUrl : item.CtaUrl?.[0]?.Href || item.CtaUrl?.Href;

  // ✅ Debug فردي لكل فيلد
  console.log('🧠 Eyebrow:', eyebrow);
  console.log('📌 Title:', title);
  console.log('📝 Description:', description);
  console.log('🔗 CTA Text:', ctaText);
  console.log('➡️ CTA Url:', ctaUrl);

  return (
    <section {...attrs} className="ExpandBox-widget">
      {eyebrow && <span className="ExpandBox-eyebrow">{eyebrow}</span>}
      {title && <h2 className="ExpandBox-title">{title}</h2>}
      {description && (
        <div
          className="ExpandBox-description"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      {ctaUrl && (
        <a href={ctaUrl} className="ExpandBox-link">
          {ctaText || 'Learn more →'}
        </a>
      )}
    </section>
  );
}

export default ExpandBox;
