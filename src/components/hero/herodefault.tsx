import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { HeroEntity } from './hero.entity';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import Image from 'next/image';

export async function HeroDefault(props: WidgetContext<HeroEntity>) {
  const attrs = htmlAttributes(props);
  let selection = props.model?.Properties?.Hero ?? (props.model?.Properties as any)?.Hero;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  let item;
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
          'Subtitle',
          'Link',
          'ActionLink',
          'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
          'Images($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
          'RelatedMedia($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
          'RelatedImages($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
        ],
      });
    } catch {
      // ignore
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="Hero-widget">
          Select a Hero item.
        </section>
      );
    }
    return null;
  }

  const title = item.Title || '';
  const subtitle = item.Subtitle || '';
  const firstOrSelf = (field: any) => (Array.isArray(field) ? field[0] : field);
  let imageField: any =
    firstOrSelf(item.Image) ||
    firstOrSelf(item.Images) ||
    firstOrSelf(item.RelatedMedia) ||
    firstOrSelf(item.RelatedImages);

  if (
    imageField &&
    !(
      imageField.Url ||
      imageField.MediaUrl ||
      imageField.ThumbnailUrl ||
      imageField.EmbedUrl ||
      imageField.Urls?.Default ||
      imageField.Urls?.DefaultUrl
    ) &&
    imageField.Id
  ) {
    try {
      const imageSelection = {
        ItemIdsOrdered: [imageField.Id],
        Content: [
          {
            Type: 'Telerik.Sitefinity.Libraries.Model.Image',
            Variations: [
              {
                Source: imageField.Provider,
                Filter: { Key: 'Id', Value: imageField.Id },
              },
            ],
          },
        ],
      };
      const id = imageSelection?.ItemIdsOrdered?.[0]?.toString();
      const provider = imageSelection?.Content?.[0]?.Variations?.[0]?.Source?.toString();
      const img = await RestClient.getItem({
        id,
        provider,
        type: 'Telerik.Sitefinity.Libraries.Model.Image',
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
      imageField = { ...img, ...imageField };
    } catch {
      // ignore
    }
  }
  const image =
    imageField?.Url ||
    imageField?.MediaUrl ||
    imageField?.ThumbnailUrl ||
    imageField?.EmbedUrl ||
    imageField?.Urls?.Default ||
    imageField?.Urls?.DefaultUrl;
  const alt = imageField?.AlternativeText || imageField?.Title || title;

  const parseLink = (linkField: any): string | undefined => {
    if (!linkField) {
      return undefined;
    }
    if (typeof linkField === 'string') {
      try {
        const parsed = JSON.parse(linkField);
        return parsed?.[0]?.href || parsed?.[0]?.Href;
      } catch {
        return linkField;
      }
    }
    if (Array.isArray(linkField)) {
      return linkField[0]?.href || linkField[0]?.Href;
    }
    return linkField.href || linkField.Href || linkField;
  };

  const link = item.ActionLink?.Href || parseLink(item.Link);

  return (
    <section {...attrs} className="Hero-widget Hero-default">
      {image && (
        <Image
          src={image}
          alt={alt || ''}
          width={800} // pick a sensible width
          height={600} // pick a sensible height
          sizes="100vw" // responsive sizing hint
          style={{ width: '100%', height: 'auto' }}
        />
      )}
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
      {link && (
        <a href={link} className="Hero-link">
          Learn more
        </a>
      )}
    </section>
  );
}

export default HeroDefault;
