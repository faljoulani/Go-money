import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { DownloadEntity } from './download.entity';
import {
  fetchData,
  extractSelectionId,
  pickImageUrl,
  pickOneMedia,
} from '../../../utils/sitefinity';
import { resolveSitefinitySelection } from '../../../utils/utils';

interface MinimizedDownloadNow {
  Id: string;
  Title?: string;
  description?: string;
  ForegroundImage?: any | any[];
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

export default async function MinimizedDownloadApp(props: WidgetContext<DownloadEntity>) {
  const attrs = htmlAttributes(props);
  const selection = resolveSitefinitySelection((props.model?.Properties as any)?.DownloadApp);
  const id = extractSelectionId(selection);
  const { culture } = props.requestContext;

  const isEdit = props.requestContext.isEdit;

  if (!id) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500"
      >
        <strong>Minimized Downlaod App</strong>
        <div className="mt-1">Open the designer and select a Downlaod List.</div>
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
  )) as MinimizedDownloadNow | null;

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
    <section {...attrs} className="relative w-full md:mx-auto rounded-3xl md:mb-16 xs:mb-10 mt-10 md:mt-[164px] md:h-[184px] md:w-[1240px] bg-[linear-gradient(258.38deg,_#6be5bf,_#b3dfef)]
        dark:bg-[linear-gradient(258.38deg,_#a6efd9,_#006aa5)]">
      <div
        className=""
      >
        <div className="relative flex flex-col md:flex-row items-center md:place-items-start gap-6 pt-8 md:py-0 px-6 md:px-16">
          {/* TEXT — order 1 on xs, middle on md+ */}
          <div className="order-1 md:order-2 w-full md:flex-1 text-[#0A1B2E] justify-start min-w-0 md:my-10">
            <h2 className="xs:text-2xl md:text-4xl font-bold leading-tight md:leading-[67px] tracking-[-0.02em] text-primaryAlt xs:mb-1">
              {title}
            </h2>

            {description && (
              <div
                className="text-base text-default md:max-w-[400px]"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>

          {/* LOGOS — order 2 on xs, last on md+ */}
          {orderedStores.length > 0 && (
            <div className="order-2 md:order-3 -ml-10 relative md:my-16 md:rtl:ml-24">
              {orderedStores.slice(0, 3).map((item: any, index: number) => (
                <a key={index} href={item.href} className="flex flex-col items-end">
                  {item.iconUrl && (
                    <div
                      className={`flex items-center justify-center h-[56px] w-[56px] rounded-full bg-[#000000] dark:bg-white border-2 border-[#6BE5BF] ${
                        index === 0
                          ? 'absolute md:right-[95px] xs:right-[100px] rtl:xs:-right-[46px] rtl:md:right-[95px] top-0 z-30'
                          : index === 1
                            ? 'absolute md:right-12 xs:right-[53px] rtl:xs:-right-[93px] rtl:md:right-12 top-0 z-20'
                            : 'relative xs:right-[6px] rtl:xs:-right-[140px] md:right-[1px] rtl:md:right-[1px]'
                      }`}
                    >
                      {index === 0 ? (
                        <div
                          className="h-7 w-7 bg-bgAlt"
                          style={{
                            WebkitMask: `url(${item.iconUrl}) no-repeat center / contain`,
                            mask: `url(${item.iconUrl}) no-repeat center / contain`,
                          }}
                          aria-hidden
                        />
                      ) : (
                        <img
                          src={item.iconUrl}
                          alt={item.title}
                          className="h-7 w-7 object-contain"
                        />
                      )}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}

          {/* PHONE — order 3 on xs, first (left) on md+ */}
          <div className="order-3 md:order-1 relative w-full md:w-[279px] md:h-[282px] min-w-0">
            {phoneUrl && (
              <img
                src={phoneUrl}
                alt={phoneAlt || 'Mobile'}
                width={360}
                height={720}
                className="mx-auto xs:w-[210px] md:w-[360px] md:mx-0 md:absolute md:left-0 md:bottom-[98px] max-h-[300px] md:max-h-none"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

