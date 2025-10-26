import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { CmsImage } from '../types/typee';
import { CmsPage } from '../types/typee';
import { resolveSitefinitySelection } from './utils';

type Culture = string | undefined;

export function extractSelectionId(selection: any) {
  if (!selection) return undefined;
  if (selection.Id) return selection.Id;
  const ids = selection?.CardListData?.ItemIdsOrdered ?? selection?.ItemIdsOrdered;
  if (Array.isArray(ids) && ids.length) return ids[0];
  const maybe = selection?.Content?.[0]?.Variations?.[0]?.Filter?.Value?.split(',')?.[0];
  return maybe || undefined;
}

export async function fetchData(
  explicitIds: string[],
  parent: any,
  culture: Culture,
  fields: string[],
  options: { itemType?: string; single?: boolean; take?: number } = {},
) {
  const { itemType, single = false, take = 6 } = options;

  const ids = explicitIds?.length
    ? explicitIds
    : ((parent?.Cards?.ItemIdsOrdered as string[] | undefined) ?? []);

  if (single && ids.length === 1) {
    try {
      return await RestClient.getItem({ type: itemType, id: ids[0], culture, fields });
    } catch {
      return null;
    }
  }

  if (ids.length) {
    const filter = {
      Logic: 'or',
      ChildFilters: ids.map((id) => ({
        FieldName: 'Id',
        Operator: 'Equal',
        FieldValue: id,
      })),
    } as const;

    const { Items = [] } = await RestClient.getItems({
      type: itemType,
      culture,
      fields,
    });

    const map = new Map(Items.map((i: any) => [i.Id, i]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  }

  const { Items = [] } = await RestClient.getItems({ type: itemType, culture, take, fields });
  return Items;
}

export function pageHref(p: CmsPage) {
  return p.RelativeUrlPath || p.ViewUrl || `/${p.UrlName ?? ''}`;
}

export function extractIdAndProvider(selection: any): { id: string | null; provider?: string } {
  const id = selection?.Content?.[0]?.ItemIdsOrdered?.[0] ?? selection?.ItemIdsOrdered?.[0] ?? null;
  const provider = selection?.Content?.[0]?.Variations?.[0]?.Source ?? selection?.Provider;
  return { id, provider };
}

export function extractItemIdsFromSelection(selection?: any): string[] {
  if (!selection) return [];
  const sel = resolveSitefinitySelection(selection) ?? selection;

  if (Array.isArray(sel?.ItemIdsOrdered) && sel.ItemIdsOrdered.length) {
    return sel.ItemIdsOrdered.filter(Boolean);
  }
  const filterVal = sel?.Content?.[0]?.Variations?.[0]?.Filter?.Value as string | undefined;
  if (typeof filterVal === 'string' && filterVal.trim()) {
    return filterVal
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function selectPrimaryImage(
  imageField: CmsImage | CmsImage[] | null | undefined,
): CmsImage | null {
  return Array.isArray(imageField) ? (imageField[0] ?? null) : (imageField ?? null);
}

export const pickOneMedia = (arr: CmsImage | CmsImage[] | null | undefined): CmsImage | null => {
  const media = Array.isArray(arr) ? arr[0] : arr;
  if (!media) return null;
  return {
    Id: media.Id,
    Title: media.Title,
    Url: media.Url ?? media.MediaUrl,
    MediaUrl: media.MediaUrl,
    ThumbnailUrl: media.ThumbnailUrl,
    EmbedUrl: media.EmbedUrl,
    AlternativeText: media.AlternativeText,
    Urls: media.Urls,
    Provider: media.Provider,
  };
};

export function pickImageUrl(img?: CmsImage): string | undefined {
  if (!img) return undefined;
  return img.Url || img.MediaUrl || img.ThumbnailUrl || img.Urls?.[0] || img.EmbedUrl || undefined;
}

export const getImageSrc = (img?: CmsImage | null): string | null => {
  if (!img) return null;
  const src = img.MediaUrl || img.Url || img.EmbedUrl || null;
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return src.startsWith('/') ? src : `/${src}`;
};

