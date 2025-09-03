import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';

export const fetchByIds = async (
  ids: string[],
  culture: string | undefined,
  type: string,
  fields: string[],
) => {
  const items = await Promise.all(
    ids.map((id) => RestClient.getItem({ type, id, culture, fields }).catch(() => null)),
  );
  return items.filter(Boolean) as any[];
};

export const idsFrom = (selection: any): string[] =>
  (selection?.ItemIdsOrdered as string[] | undefined)?.filter(Boolean) ?? [];

export const firstId = (selection: any): string | null => {
  const ids = idsFrom(selection);
  return ids.length ? ids[0] : null;
};

