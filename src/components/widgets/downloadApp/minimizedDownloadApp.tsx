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
    <section {...attrs}>
      <div
        className="md:relative md:h-[184px] md:w-[1240px] rounded-3xl md:mx-20 md:mb-16 md:mt-[164px] xs:flex xs:flex-col xs:w-[full] xs:m-4 "
        style={{ background: 'linear-gradient(258.38deg, #6BE5BF -1.4%, #B3DFEF 100%)' }}
      >
        <div className="relative flex md:flex-row xs:flex-col h-full w-full gap-6  px-16">
          {/* LEFT: phone image */}
          <div className="relative xs:order-last md:order-1 z-30 w-[279px] h-[282px]">
            {phoneUrl && (
              <img
                src={phoneUrl}
                alt={phoneAlt || 'Mobile'}
                width={360}
                height={720}
                className="absolute left-0 bottom-[98px]"
              />
            )}
          </div>

          {/* RIGHT: text + logos */}
          <div className="flex md:flex-row xs:flex-col xs:order-1 md:order-99 md:h-full md:w-[75%] xs:items-start md:items-center justify-between">
            <div className="w-full max-w-[440px] text-[#0A1B2E]">
              <h2 className="text-[36px] font-bold leading-[67px] tracking-[-0.02em] text-primary">
                {title}
              </h2>

              {description && (
                <div
                  className="mt-3 text-[16px] text-default"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
            </div>
            {/* round store logos */}

            {orderedStores.length > 0 && (
              <div className="relative my-16 flex xs:items-start md:items-end rtl:ml-24">
                {orderedStores.slice(0, 3).map((item: any, index: number) => (
                  <a key={index} href={item.href} rel="" className="flex flex-col items-end">
                    {item.iconUrl && (
                      <div
                        className={`flex items-center justify-center h-[56px] w-[56px] rounded-full bg-black border-2 border-[#6BE5BF] ${index === 0 ? 'absolute right-[95px] top-0 z-30' : `${index === 1 ? 'absolute right-12 top-0' : ''}`}`}
                      >
                        <img
                          src={item.iconUrl}
                          alt={item.title}
                          className="h-7 w-7 object-contain"
                        />
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

