import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { SmartFeaturesEntity} from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { parseMaybeJson } from '../../../utils/utils';

type Card = {
  Id: string;
  Title?: string;
  Description?: string;
  Image?: any | any[];
};

type ParentMeta = {
  Id: string;
  Title?: string;
  Description?: string;
  SubTitle?: string;
  ItemIdsOrdered?: string[];
  Image?: any | any[];
  Content?: any;
};

function idsFrom(selection?: any): string[] {
  if (!selection) return [];
  const sel = parseMaybeJson(selection) ?? selection;

  if (Array.isArray(sel?.ItemIdsOrdered) && sel.ItemIdsOrdered.length) {
    return sel.ItemIdsOrdered.filter(Boolean);
  }
  const filterVal = sel?.Content?.[0]?.Variations?.[0]?.Filter?.Value as string | undefined;
  if (typeof filterVal === 'string' && filterVal.trim()) {
    return filterVal.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

const imgUrl = (im: any) => im?.MediaUrl || im?.Url || im?.ThumbnailUrl || '';

const isApple = (t: string) => /apple store|app store|apple|ios/i.test(t);
const isGoogle = (t: string) => /play store|google play|google/i.test(t);
const isHuawei = (t: string) => /huawei|appgallery|app gallery/i.test(t);

function pickStoreBadges(cards: Card[]) {
  const out: { apple?: any; google?: any; huawei?: any } = {};
  for (const c of cards) {
    const t = (c.Title || '').toLowerCase();
    const firstImg = Array.isArray(c.Image) ? c.Image[0] : c.Image;
    if (!firstImg) continue;
    if (!out.apple && isApple(t)) out.apple = firstImg;
    else if (!out.google && isGoogle(t)) out.google = firstImg;
    else if (!out.huawei && isHuawei(t)) out.huawei = firstImg;
  }
  return out;
}

function findImageByTitle(images: any[] | undefined, needle: string) {
  if (!images) return undefined;
  const n = needle.toLowerCase();
  return images.find((im) => (im?.Title || '').toLowerCase().includes(n));
}

export default async function MinimizedDownloadNow(props: WidgetContext<SmartFeaturesEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const properties = (props.model?.Properties || {}) as any;
  const cardsSel = parseMaybeJson(properties?.Cards) ?? properties?.Cards;
  const listSel = parseMaybeJson(properties?.CardListData) ?? properties?.CardListData;

  const parentId = extractSelectionId(listSel);
  if (!parentId) {
    return isEdit ? (
      <section
        {...attrs}
        className="relative mx-auto h-[320px] max-w-[1240px]  rounded-3xl"
        style={{ background: 'linear-gradient(258.38deg, #6BE5BF -1.4%, #B3DFEF 100%)' }}
      >
        <div className="relative z-10 flex h-full w-full items-center justify-center p-10">
          <div className="w-full p-6 border border-dashed rounded-2xl text-center text-slate-600">
            <strong>Smart Features</strong>
            <div className="mt-1">Open the designer and select a Card List.</div>
          </div>
        </div>
      </section>
    ) : null;
  }

  const parentFetched = await fetchData(
    [parentId],
    null,
    culture,
    [
      'Id',
      'Title',
      'Description',
      'SubTitle',
      'ItemIdsOrdered',
      'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      'Content',
    ],
    {
      itemType: listSel?.Content?.[0]?.Type || 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Cards',
      single: true,
    },
  );
  const parent = parentFetched as ParentMeta | null;

  const cardIds: string[] =
    Array.isArray(parent?.ItemIdsOrdered) && parent!.ItemIdsOrdered.length
      ? parent!.ItemIdsOrdered
      : idsFrom(cardsSel);

  let cardsList: Card[] = [];
  if (cardIds.length) {
    const cards = (await fetchData(
      cardIds,
      null,
      culture,
      [
        'Id',
        'Title',
        'Description',
        'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      ],
      {
        itemType:
          cardsSel?.Content?.[0]?.Type || 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card',
        single: false,
      },
    )) as Card[] | Card | null;

    cardsList = Array.isArray(cards) ? cards : cards ? [cards] : [];
    const order = new Map(cardIds.map((id, i) => [id, i]));
    cardsList.sort((a, b) => (order.get(a.Id) ?? 0) - (order.get(b.Id) ?? 0));
  }

  const heading = parent?.Title || 'Download our app';
  const description = parent?.Description || parent?.SubTitle || '';

  const parentImages = Array.isArray(parent?.Image)
    ? parent!.Image
    : parent?.Image
      ? [parent.Image]
      : [];
  const mobileImg = findImageByTitle(parentImages, 'mobile') || parentImages[0];
  const mobileUrl = mobileImg ? imgUrl(mobileImg) : '';
  
  const stores = pickStoreBadges(cardsList);
  const orderedLogos = [stores.apple, stores.google, stores.huawei].filter(Boolean) as any[];
  console.log("orderedlogos:", orderedLogos );

  return (
    <section
      {...attrs}
      className="relative mx-auto h-[200px] w-[1600px]  overflow-hidden rounded-3xl"
      style={{ background: 'linear-gradient(258.38deg, #6BE5BF -1.4%, #B3DFEF 100%)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 h-[240px] w-[260px] rounded-[28px]"
        style={{ background: 'rgba(179, 223, 239, 0.65)' }}
      />

      <div className="relative flex h-full w-full gap-6  px-20">
        {/* LEFT: phone image */}
        <div className="relative z-30 h-[600px] w-[25%]">
          {mobileUrl && (
            <Image
              src={mobileUrl}
              alt={mobileImg?.AlternativeText || 'Mobile'}
              width={360}
              height={720}
              priority
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ filter: 'drop-shadow(22px -14px 36px rgba(0,0,0,0.35))' }}
            />
          )}
        </div>

        {/* RIGHT: text + logos */}
        <div className="flex h-full w-[75%] items-center justify-between">
          <div className="w-full max-w-[620px] text-[#0A1B2E]">
            <h2 className="text-[40px] font-[800] leading-[1.05] tracking-[-0.02em] text-[#00145A]">
              {heading}
            </h2>

            {description && (
              <div
                className="mt-3 text-[15px] leading-relaxed opacity-90"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
            </div>
            {/* round store logos */}
            
            {orderedLogos.length > 0 && (
              <div className="mt-6 flex items-center gap-4">
                {orderedLogos.map((im, idx) => (
                  <div
                    key={idx}
                    className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-black/90 ring-1 ring-black/10 flex items-center justify-center"
                  >
                    <Image
                      src={imgUrl(im)}
                      alt={im?.AlternativeText || im?.Title || 'store logo'}
                      width={44}
                      height={44}
                      className="object-contain"
                      priority
                    />
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
