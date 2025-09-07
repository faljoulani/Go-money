import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { ExecutiveManagmentEntity } from './executiveManagment.entity';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

export async function ExecutiveManagment(props: WidgetContext<ExecutiveManagmentEntity>) {
  const attrs = htmlAttributes(props);

  // 1) Read selection from widget model (Module Builder "Hero" selector)
  let selection =
    props.model?.Properties?.ExecutiveManagment ??
    (props.model?.Properties as any)?.ExecutiveManagment;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  // 2) Fetch the selected item with ONLY the fields we need
  let item: any;
  if (selection?.Content?.length) {
    const id = selection?.ItemIdsOrdered?.[0]?.toString();
    const provider = selection?.Content?.[0]?.Variations?.[0]?.Source?.toString();
    try {
      item = await RestClient.getItem({
        id,
        provider,
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
          'BackgroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Provider,Urls)',
        ],
      });
    } catch {
      // ignore
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="Hero-widget p-6 border border-dashed">
          Select a item.
        </section>
      );
    }
    return null;
  }

  // Helpers
  const firstOrSelf = (field: any) => (Array.isArray(field) ? field[0] : field);
  const parseLink = (linkField: any): string | undefined => {
    if (!linkField) return;
    if (typeof linkField === 'string') {
      try {
        const parsed = JSON.parse(linkField);
        return parsed?.[0]?.href || parsed?.[0]?.Href;
      } catch {
        return linkField;
      }
    }
    if (Array.isArray(linkField)) return linkField[0]?.href || linkField[0]?.Href;
    return linkField.href || linkField.Href || linkField;
  };
  const pickUrl = (m: any): string | undefined =>
    m?.Url ||
    m?.MediaUrl ||
    m?.ThumbnailUrl ||
    m?.EmbedUrl ||
    m?.Urls?.Default ||
    m?.Urls?.DefaultUrl;

  // Map fields
  const eyebrow = item.Eyebrow || '';
  const title = item.Title || '';
  const description = item.Description || '';
  const ctaText = item.CtaText || 'Learn more';
  const ctaUrl = parseLink(item.CtaUrl);

  // Resolve BackgroundImage if only Id/Provider present
  let bgMedia = firstOrSelf(item.BackgroundImage);
  if (bgMedia && !pickUrl(bgMedia) && bgMedia.Id) {
    try {
      const full = await RestClient.getItem({
        type: 'Telerik.Sitefinity.Libraries.Model.Image',
        id: bgMedia.Id?.toString(),
        provider: bgMedia.Provider?.toString(),
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          'Id',
          'Url',
          'MediaUrl',
          'ThumbnailUrl',
          'EmbedUrl',
          'Title',
          'AlternativeText',
          'Urls',
        ],
      });
      bgMedia = { ...full, ...bgMedia };
    } catch (err) {
      console.error('Hero image fetch failed:', err);
    }
  }
  const bgUrl = pickUrl(bgMedia);
  const bgAlt = bgMedia?.AlternativeText || bgMedia?.Title || title;

  // Make absolute if needed
  const toAbsolute = (u?: string) => {
    if (!u) return undefined;
    if (/^https?:\/\//i.test(u)) return u;
    const base =
      (props.requestContext as any)?.siteData?.SiteUrl ??
      (typeof window !== 'undefined' ? window.location.origin : undefined);
    try {
      return base ? new URL(u, base).toString() : u;
    } catch {
      return u;
    }
  };
  const heroImgUrl = toAbsolute(bgUrl);

  return (
    <section {...attrs} className="bg-[#EEEEEE] w-full px-20 pb-10">
      <div className="flex flex-row items-center pr-8 pl-10.5 pt-4 pb-7 bg-white rounded-3xl space-x-8">
        <div className="absolute top-0 right-12">
          <img src="/icons/Vector.svg" alt={bgAlt} />
        </div>
        <div className="absolute top-[204px] right-2">
          <img src="/icons/Floating-button.svg" alt={bgAlt} />
        </div>
        <div className="justify-start">
          <img
            src={heroImgUrl}
            alt={bgAlt}
            className="rounded-[20px] w-[417px] h-[506px] object-cover"
          />
        </div>
        <div className="text-start w-[522px] space-y-3">
          <div className="space-y-3">
            {eyebrow && <Eyebrow align="left">{eyebrow}</Eyebrow>}
            {title && (
              <Title
                align="left"
                style={{
                  fontSize: '33px',
                  color: 'var(--Text-text-primary, #010663)',
                  fontWeight: 700,
                }}
              >
                {title}
              </Title>
            )}
          </div>
          <div>
            {description && (
              <Description
                align="left"
                style={{
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '100%',
                }}
              >
                {description}
              </Description>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExecutiveManagment;

