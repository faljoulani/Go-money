import Link from 'next/link';
import {
  WidgetContext,
  htmlAttributes,
  RestClientForContext,
} from '@progress/sitefinity-nextjs-sdk';
import { ContactSubscriptionEntity } from './contactSubscription.entity';

const SUBSCRIPTION_TYPE =
  'Telerik.Sitefinity.DynamicTypes.Model.ContactSubscription.Contactsubscription';

// Helpers
const toBool = (v: any) =>
  typeof v === 'boolean' ? v : String(v ?? '').toLowerCase() === 'true';

type ParsedLink = { href: string; text?: string; target?: string } | null;

/**
 * Sitefinity link fields (LinkItemModel) are stored as JSON (often an array).
 * This parser is defensive against: string, object, array, null/undefined.
 */
function parseLink(value: any): ParsedLink {
  if (!value) return null;

  let raw: any = value;

  // If it's a JSON string, try to parse
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      // If it's just a plain URL string
      const href = String(raw || '').trim();
      return href ? { href } : null;
    }
  }

  // If array, take the first truthy object
  if (Array.isArray(raw)) {
    raw = raw.find((x) => !!x) ?? null;
  }

  if (!raw || typeof raw !== 'object') return null;

  const href = String(raw.Href ?? raw.href ?? '').trim();
  if (!href) return null;

  const text = String(raw.Text ?? raw.text ?? raw.Title ?? '').trim() || undefined;
  const target = String(raw.Target ?? raw.target ?? '').trim() || undefined;

  return { href, text, target };
}

const single = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

export default async function ContactSubscription(
  props: WidgetContext<ContactSubscriptionEntity>
) {
  const attrs = htmlAttributes(props);

  // read designer selection (MixedContent)
  let selection =
    props.model?.Properties?.ContactSubscription ??
    (props.model?.Properties as any)?.ContactSubscription;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

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
          // Expand all related ContactBox items; include your exact fields
          'Box(' +
            '$select=Id,Title,SubTitle,CallUsLabel,CallUsText,CTAURL,EmailLabel,EmailText,EmailPlaceholder,ButtonLabel,hasLabelCorner' +
          ')',
        ],
      } as any);
    } catch (e) {
      console.error('Error fetching ContactSubscription item:', e);
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="p-4 border rounded text-sm text-gray-600">
          Select a “Contact subscription” item.
        </section>
      );
    }
    return null;
  }

  // Normalize ContactBox items + CTAURL
  const boxes = (Array.isArray(item.Box) ? item.Box : []).map((b: any) => {
    const cta = parseLink(b.CTAURL);
    const hasCorner =
      toBool((b as any).hasLabelCorner) || toBool((b as any).HasLabelCorner);

    return {
      Id: b.Id,
      Title: b.Title,
      SubTitle: b.SubTitle,
      CallUsLabel: b.CallUsLabel,
      CallUsText: b.CallUsText,
      EmailLabel: b.EmailLabel,
      EmailText: b.EmailText,
      EmailPlaceholder: b.EmailPlaceholder,
      ButtonLabel: b.ButtonLabel,
      HasLabelCorner: hasCorner,
      CTA: cta, // { href, text?, target? } | null
    };
  });

  const view = {
    Id: item.Id,
    Title: item.Title,
    UrlName: item.UrlName,
    Boxes: boxes,
  };

  return (
    <section {...attrs} className="ContactSubscription">
      {/* Optional title */}
      {item.Title ? (
        <h2 className="mb-4 text-xl font-semibold">{item.Title}</h2>
      ) : null}

      <ul className="grid gap-4 md:grid-cols-2">
        {boxes.map((box) => (
          <li
            key={box.Id}
            className="relative rounded-lg border border-gray-200 p-4"
          >
            {/* Corner ribbon */}
            {box.HasLabelCorner ? (
              <span className="absolute -right-1 -top-1 rounded-bl-lg bg-black px-2 py-1 text-xs font-medium text-white">
                {box.ButtonLabel || 'Info'}
              </span>
            ) : null}

            <div className="mb-2 text-lg font-medium">{box.Title}</div>
            {box.SubTitle ? (
              <div className="mb-3 text-sm text-gray-600">{box.SubTitle}</div>
            ) : null}

            {(box.CallUsLabel || box.CallUsText) && (
              <div className="mb-2">
                <span className="font-medium">{box.CallUsLabel || 'Call us'}</span>
                {box.CallUsText ? <span>: {box.CallUsText}</span> : null}
              </div>
            )}

            {(box.EmailLabel || box.EmailText) && (
              <div className="mb-3">
                <span className="font-medium">{box.EmailLabel || 'Email'}</span>
                {box.EmailText ? <span>: {box.EmailText}</span> : null}
                {box.EmailPlaceholder ? (
                  <div className="text-xs text-gray-500">
                    Placeholder: {box.EmailPlaceholder}
                  </div>
                ) : null}
              </div>
            )}

            {box.CTA ? (
              <Link
                href={box.CTA.href}
                target={box.CTA.target}
                rel={box.CTA.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              >
                {box.ButtonLabel || box.CTA.text || 'Learn more'}
              </Link>
            ) : (
              <div className="text-sm italic text-gray-500">No CTA link</div>
            )}
          </li>
        ))}
      </ul>

      {/* Debug JSON (remove in production) */}
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          fontSize: 12,
          background: '#f9f9f9',
          padding: 10,
        }}
        className="mt-4"
      >
        {JSON.stringify(view, null, 2)}
      </pre>
    </section>
  );
}
