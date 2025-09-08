// components/widgets/supportInfoBox/supportInfoBox.tsx
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import type { SupportInfoBoxEntity } from './supportInfoBox.entity';

const TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.SupportInfoBox.SupportInfoBox';

type CmsImage = {
  Url?: string;
  MediaUrl?: string;
  ThumbnailUrl?: string;
  AlternativeText?: string;
  Title?: string;
} | null;

const imgUrl = (i?: CmsImage) => i?.MediaUrl || i?.Url || i?.ThumbnailUrl || undefined;

function parseSelection(raw: unknown) {
  if (!raw) return undefined;
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return undefined; } }
  return raw as any;
}

function firstIdFromSelection(sel: any) {
  if (!sel) return undefined;
  if (sel.Id) return sel.Id;
  const ids =
    sel?.ItemIdsOrdered ??
    sel?.CardListData?.ItemIdsOrdered ??
    sel?.Content?.[0]?.Variations?.[0]?.Filter?.Value?.split(',');
  return Array.isArray(ids) ? ids[0] : ids;
}

export default async function SupportInfoBox(props: WidgetContext<SupportInfoBoxEntity>) {
  console.log('================= [SupportInfoBox] FULL PROPS =================');
  console.log(JSON.stringify(props, null, 2));
  console.log('===============================================================');

  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const selection = parseSelection(
    props.model?.Properties?.SupportInfoBox ?? (props.model?.Properties as any)?.SupportInfoBox
  );
  console.log('[SupportInfoBox] selection =>', JSON.stringify(selection, null, 2));

  const id = firstIdFromSelection(selection);
  console.log('[SupportInfoBox] selected item id =>', id);

  if (!id) {
    return isEdit ? (
      <section {...attrs} className="p-6 border border-dashed rounded-2xl text-center text-slate-500">
        <strong>SupportInfoBox</strong>
        <div className="mt-1">Open the designer and select a SupportInfoBox item.</div>
      </section>
    ) : null;
  }

  // Request both Logo and Icon for InfoLinks to cover both schemas
  const item = await RestClient.getItem({
    type: TYPE,
    id,
    culture,
    fields: [
      'Id',
      'Title',
      'Description',
      'HasLabel',
      // NOTE: ask for Title, Order, Logo + Icon; Url/StoreType are optional if present
      'InfoLinks($select=Id,Title,Order,Url,StoreType,Logo($select=Url,MediaUrl,ThumbnailUrl,AlternativeText,Title),Icon($select=Url,MediaUrl,ThumbnailUrl,AlternativeText,Title))',
      'SocialLinks($select=Id,Title,Description,Order,Logo($select=Url,MediaUrl,ThumbnailUrl,AlternativeText,Title))',
    ],
  });

  console.log('================= [SupportInfoBox] FETCHED ITEM =================');
  console.log(JSON.stringify(item, null, 2));
  console.log('=================================================================');

  if (!item) return null;

  const infos = (item.InfoLinks || [])
    .filter((x: any) => x?.IsVisible !== false) // harmless if IsVisible is absent
    .sort((a: any, b: any) => (a?.Order ?? 0) - (b?.Order ?? 0));

  const socials = (item.SocialLinks || [])
    .sort((a: any, b: any) => (a?.Order ?? 0) - (b?.Order ?? 0));

  // href helper (tolerant if fields are missing)
  const normalizePhone = (s: string) => (s || '').replace(/[^\d+]/g, '');
  const infoHref = (s: any) => {
    if (s?.StoreType === 'Email' && s?.Url) return `mailto:${s.Url}`;
    if (s?.StoreType === 'Phone' && s?.Url) return `tel:${normalizePhone(s.Url)}`;
    return s?.Url || '#';
  };

  // Debug: print what media we actually got for InfoLinks
  console.log(
    '[SupportInfoBox] InfoLinks media check:',
    infos.map((x: any) => ({
      id: x.Id,
      title: x.Title,
      hasLogo: !!(Array.isArray(x.Logo) ? x.Logo[0] : x.Logo),
      hasIcon: !!(Array.isArray(x.Icon) ? x.Icon[0] : x.Icon),
    }))
  );

  return (
    <section {...attrs} className="relative overflow-hidden rounded-[28px] bg-white p-8 md:p-12 shadow-sm">
      {item.Title && <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B2A8E]">{item.Title}</h2>}
      {item.Description && <p className="text-xl text-gray-400 mt-4">{item.Description}</p>}

      {/* Info links */}
      <div className="mt-10 space-y-8">
        {infos.map((s: any) => {
          const media = Array.isArray(s.Logo) ? s.Logo[0]
                       : s.Logo ?? (Array.isArray(s.Icon) ? s.Icon[0] : s.Icon);
          return (
            <div key={s.Id} className="flex items-center gap-4">
              {imgUrl(media) ? (
                <img
                  src={imgUrl(media)}
                  alt={media?.AlternativeText || media?.Title || s.Title}
                  className="h-10 w-10 object-contain"
                  draggable={false}
                />
              ) : (
                <span className="h-10 w-10 rounded-xl border flex items-center justify-center">•</span>
              )}
              <a href={infoHref(s)} className="text-lg md:text-xl font-semibold text-gray-700 hover:underline">
                {s.Url || s.Title}
              </a>
            </div>
          );
        })}
      </div>

      {/* Social links */}
      {socials.length ? (
        <div className="mt-10 flex items-center gap-4">
          {socials.map((s: any) => {
            const logo = Array.isArray(s.Logo) ? s.Logo[0] : s.Logo;
            return (
              <span key={s.Id} className="h-14 w-14 rounded-2xl border-2 border-[#0B2A8E] flex items-center justify-center" title={s.Title}>
                {imgUrl(logo) ? (
                  <img src={imgUrl(logo)} alt={logo?.AlternativeText || s.Title} className="h-7 w-7 object-contain" />
                ) : (
                  <span className="text-[#0B2A8E] font-bold">{s.Title?.[0] ?? '•'}</span>
                )}
              </span>
            );
          })}
        </div>
      ) : null}

      {item.HasLabel && <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#0B2A8E] rounded-tl-[40px]" />}
    </section>
  );
}
