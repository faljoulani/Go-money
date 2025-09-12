import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { CmsImage } from '../types/Type';

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

export type CmsPage = {
  Id: string;
  Title: string;
  UrlName?: string;
  ViewUrl?: string;
  RelativeUrlPath?: string;
  HasChildren?: boolean;
};

export function pageHref(p: CmsPage) {
  return p.RelativeUrlPath || p.ViewUrl || `/${p.UrlName ?? ''}`;
}

export function parseSelection(raw: unknown): any | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return raw as any;
}

export function extractIdAndProvider(selection: any): { id: string | null; provider?: string } {
  const id = selection?.Content?.[0]?.ItemIdsOrdered?.[0] ?? selection?.ItemIdsOrdered?.[0] ?? null;
  const provider = selection?.Content?.[0]?.Variations?.[0]?.Source ?? selection?.Provider;
  return { id, provider };
}

export const firstMedia = (val: CmsImage | CmsImage[] | null | undefined): CmsImage | null =>
  Array.isArray(val) ? (val[0] ?? null) : (val ?? null);

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

export const getImageSrc = (img?: CmsImage | null): string | null => {
  if (!img) return null;
  const src = img.MediaUrl || img.Url || img.EmbedUrl || null;
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return src.startsWith('/') ? src : `/${src}`;
};
