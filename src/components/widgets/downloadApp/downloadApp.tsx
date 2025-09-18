import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { DownloadAppEntity } from './downloadApp.entity';
import {
  fetchData,
  extractSelectionId,
  extractItemIdsFromSelection,
} from '../../../utils/sitefinity';
import { resolveSitefinitySelection } from '../../../utils/utils';
import MinimizedDownloadApp from './minimizedDownloadApp';
import { ImgUrl as imgUrl, CmsImage } from '../../../types/Type';

import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

type ChildCard = {
  Id: string;
  Title?: string;
  Description?: string;
  Image?: any | any[];
};

type ParentCard = {
  Id: string;
  Title?: string;
  Description?: string;
  SubTitle?: string;
  ItemIdsOrdered?: string[];
  Image?: any | any[];
  Content?: any;
};

export function findImageByTitle(
  imageList: Array<CmsImage | null | undefined> | undefined,
  titleQuery: string,
): CmsImage | undefined {
  if (!imageList || !titleQuery?.trim()) return undefined;
  const query = titleQuery.trim().toLowerCase();
  return imageList.find((img) => (img?.Title ?? '').toLowerCase().includes(query));
}

const isApple = (store: string) => /apple store|app store|apple|ios/i.test(store);
const isGoogle = (store: string) => /play store|google play|google/i.test(store);
const isHuawei = (store: string) => /huawei|appgallery|app gallery/i.test(store);

function pickStoreBadges(storeCards: ChildCard[]) {
  const badges: { apple?: any; google?: any; huawei?: any } = {};

  for (const card of storeCards) {
    const title = (card.Title || '').toLowerCase();
    const primaryImage = Array.isArray(card.Image) ? card.Image[0] : card.Image;
    if (!primaryImage) continue;

    if (!badges.apple && isApple(title)) badges.apple = primaryImage;
    else if (!badges.google && isGoogle(title)) badges.google = primaryImage;
    else if (!badges.huawei && isHuawei(title)) badges.huawei = primaryImage;
  }

  return badges;
}

function getNonStoreCards(allChildCards: ChildCard[]): ChildCard[] {
  return allChildCards.filter((card) => {
    const titleLower = (card.Title ?? '').toLowerCase();
    const isStoreBadge = isApple(titleLower) || isGoogle(titleLower) || isHuawei(titleLower);
    return !isStoreBadge;
  });
}

export default async function HighlightBlock(props: WidgetContext<DownloadAppEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';

  return (
    <section {...attrs} data-view={selectedView}>
      <div data-react-root>
        {selectedView === 'MinimizedDownloadApp' ? (
          <MinimizedDownloadApp {...props} />
        ) : (
          <DownloadAppDefault {...props} />
        )}
      </div>
    </section>
  );
}

async function DownloadAppDefault(props: WidgetContext<DownloadAppEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const selection = (props.model?.Properties || {}) as any;
  const cardsSelection = resolveSitefinitySelection(selection?.Cards) ?? selection?.Cards;
  const listSelection =
    resolveSitefinitySelection(selection?.CardListData) ?? selection?.CardListData;

  const parentCardId = extractSelectionId(listSelection);

  if (!parentCardId) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>Download App Design</strong>
        <div className="mt-1">Open the designer and select the desired design.</div>
      </section>
    ) : null;
  }

  const parentCardPayload = await fetchData(
    [parentCardId],
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
      itemType:
        listSelection?.Content?.[0]?.Type || 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Cards',
      single: true,
    },
  );
  const parentCard = parentCardPayload as ParentCard | null;

  const cardIds: string[] =
    Array.isArray(parentCard?.ItemIdsOrdered) && parentCard!.ItemIdsOrdered.length
      ? parentCard!.ItemIdsOrdered
      : extractItemIdsFromSelection(cardsSelection);

  let cardsList: ChildCard[] = [];
  if (cardIds.length) {
    const childCardsPayload = (await fetchData(
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
          cardsSelection?.Content?.[0]?.Type || 'Telerik.Sitefinity.DynamicTypes.Model.Cards.Card',
        single: false,
      },
    )) as ChildCard[] | ChildCard | null;

    cardsList = Array.isArray(childCardsPayload)
      ? childCardsPayload
      : childCardsPayload
        ? [childCardsPayload]
        : [];
    const order = new Map(cardIds.map((id, i) => [id, i]));
    cardsList.sort((a, b) => (order.get(a.Id) ?? 0) - (order.get(b.Id) ?? 0));
  }

  const title = parentCard?.Title || 'Download Go Money App Today';
  const description = parentCard?.Description || parentCard?.SubTitle || '';

  const parentImages = Array.isArray(parentCard?.Image)
    ? parentCard!.Image
    : parentCard?.Image
      ? [parentCard.Image]
      : [];
  const mobileImg = findImageByTitle(parentImages, 'mobile') || parentImages[0];
  const mobileUrl = mobileImg ? imgUrl(mobileImg) : '';

  const stores = pickStoreBadges(cardsList);
  const orderedBadges = [stores.apple, stores.google, stores.huawei].filter(Boolean) as any[];

  const infoCards = getNonStoreCards(cardsList).slice(0, 2);

  return (
    <section
      {...attrs}
      className="relative h-auto w-auto rounded-3xl mx-20 my-16 px-16 fadeup"
      style={{ background: 'linear-gradient(258.38deg, #6BE5BF -1.4%, #B3DFEF 100%)' }}
    >
      <div className="relative z-10 flex h-full w-full items-center gap-[30px]">
        {/* CHILD 1: ONLY IMAGE (phone) */}
        <div className="flex h-[528px] w-[507px] items-center justify-center fadeLeftDownload">
          {mobileUrl && (
            <Image
              src={mobileUrl}
              alt={mobileImg?.AlternativeText || 'Mobile'}
              width={507}
              height={525}
              priority
              className="pointer-events-none select-none object-contain animate-float absolute -top-2"
            />
          )}
        </div>

        {/* CHILD 2: Title + Description + Info row + Store badges row */}
        <div className="flex h-full w-1/2 items-center my-16 fadeRightDownload">
          <div className="w-full max-w-[560px] text-[#010663]">
            <Title>{title}</Title>
            {description && (
              <Description html={description} className="mt-4 text-base leading-relaxed" />
            )}
            {/* One-line info cards (non-store) */}
            {infoCards.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-8">
                {infoCards.map((card) => {
                  const icon = Array.isArray(card.Image) ? card.Image[0] : card.Image;
                  return (
                    <div key={card.Id} className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        {icon && (
                          <Image
                            src={imgUrl(icon)}
                            alt={icon?.AlternativeText || card.Title || 'icon'}
                            width={48}
                            height={48}
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
              <div className="mt-6 flex items-center gap-3 mr-16">
                {orderedBadges.map((im, idx) => (
                  <Image
                    key={idx}
                    src={imgUrl(im)}
                    alt={im?.AlternativeText || im?.Title || 'store badge'}
                    width={173}
                    height={52}
                    priority
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-8 h-8 w-full defaultBgColor z-30"></div>
    </section>
  );
}

