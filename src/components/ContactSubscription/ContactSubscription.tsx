import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { ContactSubscriptionEntity } from './ContactSubscription.entity';

const SUBSCRIPTION_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.ContactSubscription.Contactsubscription';

export async function ContactSubscription(props: WidgetContext<ContactSubscriptionEntity>) {
  const attrs = htmlAttributes(props);

  let selection = props.model?.Properties?.ContactSubscription ?? (props.model?.Properties as any)?.ContactSubscription;
  if (typeof selection === 'string') { try { selection = JSON.parse(selection); } catch { selection = undefined; } }

  let item: any;
  if (selection?.Content?.length) {
    try {
      item = await RestClientForContext.getItem(selection, {
        type: SUBSCRIPTION_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          'Id',
          'Title',
          'UrlName',
          // 👇 retrieve all fields from related ContactBox items
          'Box($select=Id,Title,SubTitle,CallUsLabel,CallUsText,EmailLabel,EmailText,EmailPlaceholder,ButtonLabel,hasLabelCorner;$expand=CTA($select=Id,Title,DefaultUrl))',
        ],
      });
    } catch (e) { console.error('Error fetching ContactSubscription item:', e); }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return <section {...attrs} className="ContactSubscription-widget">Select a “Contact subscription” item.</section>;
    }
    return null;
  }

  const toBool = (v: any) => (typeof v === 'boolean' ? v : String(v ?? '').toLowerCase() === 'true');

  // Normalize ALL Box items (not only first)
  const boxes = Array.isArray(item.Box) ? item.Box.map((b: any) => ({
    Id: b.Id,
    Title: b.Title,
    SubTitle: b.SubTitle,
    CallUsLabel: b.CallUsLabel,
    CallUsText: b.CallUsText,
    EmailLabel: b.EmailLabel,
    EmailText: b.EmailText,
    EmailPlaceholder: b.EmailPlaceholder,
    ButtonLabel: b.ButtonLabel,
    HasLabelCorner: toBool(b.hasLabelCorner),
    CTA: b.CTA ? {
      Id: b.CTA.Id,
      Title: b.CTA.Title,
      DefaultUrl: b.CTA.DefaultUrl ?? null,
    } : null,
  })) : [];

  const view = { Id: item.Id, Title: item.Title, UrlName: item.UrlName, Boxes: boxes };

  // Render as list
  return (
    <section {...attrs} className="ContactSubscription-debug">
      <h2>Contact Subscription (Debug)</h2>

      

      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#f9f9f9', padding: 10 }}>
        {JSON.stringify(view, null, 2)}
      </pre>
    </section>
  );
}

export default ContactSubscription;
