import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';

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

