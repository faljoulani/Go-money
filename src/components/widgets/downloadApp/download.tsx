import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import {
  fetchData,
  extractSelectionId,
  pickImageUrl,
  pickOneMedia,
} from '../../../utils/sitefinity';
import type { DownloadEntity } from './download.entity';
import MinimizedDownloadApp from './minimizedDownloadApp';
import { resolveSitefinitySelection, mergeClasses } from '../../../utils/utils';

import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

interface DownloadAppItem {
  Id: string;
  Title?: string;
  description?: string;
  ForegroundImage?: any | any[];
  Certifications?: Array<{
    Id: string;
    Title?: string;
    description?: string;
    Order?: number;
    IsVisible?: boolean;
    Logo?: any | any[];
  }>;
  stores?: Array<{
    Id: string;
    Title?: string;
    Description?: string;
    Url?: string;
    Order?: number;
    IsVisible?: boolean;
    Icon?: any | any[];
  }>;
}

export default async function Download(props: WidgetContext<DownloadEntity>) {
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
          <DownloadApp {...props} />
        )}
      </div>
    </section>
  );
}

async function DownloadApp(props: WidgetContext<DownloadEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const selection = resolveSitefinitySelection((props.model?.Properties as any)?.DownloadApp);
  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...(attrs as any)}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>Select a Download App item</strong>
        <div className="mt-1">Open the designer and select the desired item.</div>
      </section>
    ) : null;
  }

  const item = (await fetchData(
    [id],
    null,
    culture,
    [
      'Id',
      'Title',
      'description',
      'ForegroundImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls)',
      'Certifications($select=Id,Title,description,Order,IsVisible,' +
        'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
      'stores($select=Id,Title,Description,Order,IsVisible,' +
        'Icon($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
    ],
    {
      itemType:
        selection?.Content?.[0]?.Type ||
        'Telerik.Sitefinity.DynamicTypes.Model.DownloadApp.Downloadapp',
      single: true,
    },
  )) as DownloadAppItem | null;

  if (!item) {
    return isEdit ? (
      <section
        {...(attrs as any)}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        Unable to load the Download App item.
      </section>
    ) : null;
  }

  const title = item.Title || 'Download Go Money App Today';
  const description = item.description || '';

  const phoneIm = pickOneMedia(item.ForegroundImage);
  const phoneUrl = pickImageUrl(phoneIm);
  const phoneAlt = (phoneIm?.AlternativeText as string) || phoneIm?.Title || 'App screenshot';

  const infoCards = item.Certifications.map((card) => {
    const logo = pickOneMedia(card?.Logo);
    return {
      id: card?.Id,
      title: card?.Title || '',
      desc: card?.description || '',
      logoUrl: pickImageUrl(logo),
      logoAlt: logo?.AlternativeText || logo?.Title || card?.Title || 'certification',
    };
  });

  const orderedStores = item.stores.map((store, index) => {
    const icon = pickOneMedia(store?.Icon);
    return {
      title: store?.Title || '',
      href: store?.Url || '#',
      iconUrl: pickImageUrl(icon),
      iconAlt: icon?.AlternativeText || icon?.Title || store?.Title || `store-badge-${index + 1}`,
    };
  });

  return (
    <section
      {...(attrs as any)}
      className={mergeClasses(
        'relative md:h-[486px] xs:h-[700px] rounded-3xl md:mx-20 md:px-16 my-16 fadeup ',
        (attrs as any)?.className || '',
      )}
      style={{ background: 'linear-gradient(258.38deg, #6BE5BF -1.4%, #B3DFEF 100%)' }}
    >
      <div className="relative z-10 flex md:flex-row xs:flex-col h-full w-full items-center  gap-[30px]">
        {/* Left: phone image */}
        <div className="flex md:h-[528px] md:w-[507px] xs:w-[50%] fadeLeftDownload">
          {!!phoneUrl && (
            <Image
              src={phoneUrl}
              alt={phoneAlt}
              width={507}
              height={525}
              priority
              className="md:w-[50px] xs:mb-14 md:h-[525px] xs:w-[100%] pointer-events-none select-none object-contain md:absolute xs:-top-2 md:-top-2 md:animate-float"
            />
          )}
        </div>

        <div className="flex xs:w-[90%] md:h-full md:w-1/2 md:items-center md:my-16 md:fadeRightDownload">
          <div className="w-full max-w-[560px] text-[#010663]">
            {!!title && (
              <Title className="font-bold tracking-tight md:text-5xl xs:text-2xl leading-snug">{title}</Title>
            )}
            {!!description && <Description html={description} className="mt-4" />}

            {/* Info chips from Certifications (max 2) */}
            {infoCards.length > 0 && (
              <div className="mt-6 flex md:flex-row xs:flex-col xs:gap-3 md:divide-x md:divide-[#7B80FF] rtl:divide-x-reverse">
                {infoCards.map((card, index) => (
                  <div
                    key={index}
                    className={` flex items-start gap-3 ${index == 1 ? 'md:pl-6 md:rtl:pr-6 md:rtl:pl-0' : 'md:rtl:pl-6 md:rtl:pr-0 md:pr-6'}`}
                  >
                    {/* Logo */}
                    <div className="rounded-2xl bg-white/20 flex items-center justify-center">
                      {card.logoUrl && (
                        <Image
                          src={card.logoUrl}
                          alt={card.logoAlt}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-contain"
                        />
                      )}
                    </div>
                    {/* Text */}
                    <div className="min-w-0 space-y-2">
                      <div className="text-[16px] font-bold text-[#212121]">{card.title}</div>
                      {!!card.desc && (
                        <div
                          className="text-sm text-default"
                          dangerouslySetInnerHTML={{ __html: card.desc }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Store badges (ordered as provided) */}
            {orderedStores.length > 0 && (
              <div className="mt-6 flex items-center rtl:justify-end gap-3 rtl:flex-row-reverse">
                {orderedStores.map((store, idx) =>
                  store.iconUrl ? (
                    <a key={idx} href={store.href}>
                      <Image
                        src={store.iconUrl}
                        alt={store.iconAlt}
                        width={173}
                        height={52}
                        priority
                        className="w-[173px] h-[52px] object-contain"
                      />
                    </a>
                  ) : (
                    <a
                      key={idx}
                      href={store.href}
                      className="px-4 py-2 rounded-xl bg-white/20 text-sm font-semibold"
                    >
                      {store.title}
                    </a>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className=" xs:hidden md:absolute -bottom-8 h-8 w-full defaultBgColor z-30" />
    </section>
  );
}

