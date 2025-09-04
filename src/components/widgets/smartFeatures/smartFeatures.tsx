import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { CardSectionEntity } from './card.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';

type AnySel = any;

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

// ---------- utils ----------
function parseMaybeJson<T = any>(value: unknown): T | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {}
  }
  return undefined;
}

function idsFrom(selection?: AnySel): string[] {
  if (!selection) return [];
  const sel = parseMaybeJson(selection) ?? selection;

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

const imgUrl = (im: any) => im?.MediaUrl || im?.Url || im?.ThumbnailUrl || '';

function findImageByTitle(images: any[] | undefined, needle: string) {
  if (!images) return undefined;
  const n = needle.toLowerCase();
  return images.find((im) => (im?.Title || '').toLowerCase().includes(n));
}

// ---- store-only helpers (by CARD TITLE) ----
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

function getNonStoreCards(cards: Card[]): Card[] {
  return cards.filter((c) => {
    const t = (c.Title || '').toLowerCase();
    return !(isApple(t) || isGoogle(t) || isHuawei(t));
  });
}

function Placeholder() {
  return (
    <div className="w-full p-6 border border-dashed rounded-2xl text-center text-slate-600">
      <strong>Smart Features</strong>
      <div className="mt-1">Open the designer and select a Card List.</div>
    </div>
  );
}
const EmptyNode = () => <div className="sr-only" aria-hidden />;

// ---------- component ----------
export default async function SmartFeatures(props: WidgetContext<CardSectionEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  // Normalize selections
  const properties = (props.model?.Properties || {}) as any;
  const cardsSel = parseMaybeJson(properties?.Cards) ?? properties?.Cards;
  const listSel = parseMaybeJson(properties?.CardListData) ?? properties?.CardListData;

  // Parent comes from CardListData
  const parentId = extractSelectionId(listSel);
  if (!parentId) {
    return isEdit ? (
      <section
        {...attrs}
        className="relative mx-auto h-[486px] w-[1240px] overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(258.38deg, #6BE5BF -1.4%, #B3DFEF 100%)' }}
      >
        <div className="relative z-10 flex h-full w-full items-center justify-center p-10">
          <Placeholder />
        </div>
      </section>
    ) : null;
  }

  // 1) Fetch parent (title/description/phone image + ordered children)
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

  // 2) Resolve child IDs
  const cardIds: string[] =
    Array.isArray(parent?.ItemIdsOrdered) && parent!.ItemIdsOrdered.length
      ? parent!.ItemIdsOrdered
      : idsFrom(cardsSel);

  // 3) Fetch child cards (need Title, Description, Image)
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

  const hasContent = !!parent;

  // Parent Title/Description
  const heading = parent?.Title || 'Download Go Money App Today';
  const description = parent?.Description || parent?.SubTitle || '';

  // Left image: "mobile" from parent images
  const parentImages = Array.isArray(parent?.Image)
    ? parent!.Image
    : parent?.Image
      ? [parent.Image]
      : [];
  const mobileImg = findImageByTitle(parentImages, 'mobile') || parentImages[0];
  const mobileUrl = mobileImg ? imgUrl(mobileImg) : '';

  // Store badges (images only)
  const stores = pickStoreBadges(cardsList);
  const orderedBadges = [stores.apple, stores.google, stores.huawei].filter(Boolean) as any[];

  // Non-store feature cards (take first two; one row)
  const infoCards = getNonStoreCards(cardsList).slice(0, 2);

  return (
    <section
      {...attrs}
      className="relative mx-auto h-[486px] w-[1240px] overflow-hidden rounded-3xl"
      style={{ background: 'linear-gradient(258.38deg, #6BE5BF -1.4%, #B3DFEF 100%)' }}
    >
      <div className="relative z-10 flex h-full w-full items-center justify-between gap-[64px] p-10">
        {!hasContent ? (
          isEdit ? (
            <Placeholder />
          ) : (
            <EmptyNode />
          )
        ) : (
          <>
            {/* CHILD 1: ONLY IMAGE (phone) */}
            <div className="relative flex h-full w-1/2 items-center justify-center">
              {mobileUrl && (
                <Image
                  src={mobileUrl}
                  alt={mobileImg?.AlternativeText || 'Mobile'}
                  width={430}
                  height={860}
                  priority
                  className="pointer-events-none select-none object-contain"
                  style={{ filter: 'drop-shadow(28px -18px 42px rgba(0,0,0,0.35))' }}
                />
              )}
            </div>

            {/* CHILD 2: Title + Description + Info row + Store badges row */}
            <div className="flex h-full w-1/2 items-center pr-2">
              <div className="w-full max-w-[560px] text-[#010663]">
                <h2 className="text-[48px] font-[700] leading-[1] tracking-[-0.02em]">{heading}</h2>

                {description && (
                  <div
                    className="mt-4 text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}

                {/* One-line info cards (non-store) */}
                {infoCards.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-8">
                    {infoCards.map((card) => {
                      const icon = Array.isArray(card.Image) ? card.Image[0] : card.Image;
                      return (
                        <div key={card.Id} className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            {icon && (
                              <Image
                                src={imgUrl(icon)}
                                alt={icon?.AlternativeText || card.Title || 'icon'}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-lg font-semibold">{card.Title}</div>
                            {card.Description && (
                              <div
                                className="text-sm text-[#0a1b2e]/80"
                                dangerouslySetInnerHTML={{ __html: card.Description }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Store badges (images only) — Apple → Google → Huawei */}
                {orderedBadges.length > 0 && (
                  <div className="mt-6 flex items-center gap-3">
                    {orderedBadges.map((im, idx) => (
                      <Image
                        key={idx}
                        src={imgUrl(im)}
                        alt={im?.AlternativeText || im?.Title || 'store badge'}
                        width={180}
                        height={56}
                        className="h-14 w-auto select-none"
                        priority
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

