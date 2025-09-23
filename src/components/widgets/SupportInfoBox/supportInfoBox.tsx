import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { SupportInfoBoxEntity } from './supportInfoBox.entity';
import { fetchData } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, firstIdFromSelection } from '../../../utils/utils';
import Description from '../../atoms/description/description';
import Title from '../../atoms/title/title';
import { CmsImage, ImgUrl as imgUrl } from '../../../types/Type';

import Link from 'next/link';
import Image from 'next/image';

const firstMedia = (m: any): CmsImage => (Array.isArray(m) ? m[0] : m) ?? null;

const imgPath = (m?: CmsImage | null) => m?.MediaUrl || m?.Url || m?.ThumbnailUrl || null;

export default async function SupportInfoBox(props: WidgetContext<SupportInfoBoxEntity>) {
  const attrs = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const selection = resolveSitefinitySelection(
    props.model?.Properties?.SupportInfoBox ?? (props.model?.Properties as any)?.SupportInfoBox,
  );
  const id = firstIdFromSelection(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>SupportInfoBox</strong>
        <div className="mt-1">Open the designer and select a SupportInfoBox item.</div>
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
      'Description',
      'HasLabel',
      'InfoLinks($select=Id,Title,Description,Url,StoreType,Order,IsVisible,Logo($select=Url,MediaUrl,ThumbnailUrl,AlternativeText,Title),Icon($select=Url,MediaUrl,ThumbnailUrl,AlternativeText,Title))',
      'SocialLinks($select=Id,Title,Description,Url,Order,Logo($select=Url,MediaUrl,ThumbnailUrl,AlternativeText,Title))',
    ],
    { itemType: selection?.Content?.[0]?.Type, single: true },
  )) as any | null;

  if (!item) return null;

  const infos = (item.InfoLinks || [])
    .filter((x: any) => x?.IsVisible !== false)
    .sort((a: any, b: any) => (a?.Order ?? 0) - (b?.Order ?? 0));

  const socials = (item.SocialLinks || []).sort(
    (a: any, b: any) => (a?.Order ?? 0) - (b?.Order ?? 0),
  );

  return (
    <section
      {...attrs}
      className="relative flex flex-col items-start justify-between overflow-hidden rounded-[20px] h-full bg-white p-10 shadow-sm"
    >
      <div className="space-y-4">
        <Title color="text-primary" className="text-28px font-bold">
          {item.Title}
        </Title>
        <Description
          color="text-neutral"
          className="text-18px font-semibold leading-[100%] tracking-[0]"
          html={item.Description}
        />
      </div>

      {/* Info */}
      <div className="mt-10 space-y-2">
        {infos.map((social: any) => {
          const media =
            (Array.isArray(social.Logo) ? social.Logo[0] : social.Logo) ??
            (Array.isArray(social.Icon) ? social.Icon[0] : social.Icon);
          return (
            <div key={social.Id} className="flex items-center gap-4">
              {imgUrl(media) && (
                <img
                  src={imgUrl(media)}
                  alt={media?.AlternativeText || media?.Title || social.Title}
                  className="h-10 w-10 object-contain"
                  draggable={false}
                />
              )}
              <Description
                color="text-default"
                className="font-semibold leading-[100%] tracking-[0]"
                html={social.Description}
              />
            </div>
          );
        })}
      </div>

      {socials?.length > 0 && (
        <div className="mt-10 flex items-center gap-4">
          {socials.map((social: any, i: number) => {
            const sImg = firstMedia(social.Logo);
            const sSrc = imgPath(sImg);

            return (
              <Link
                key={social.Id ?? `social-${i}-${social.Title ?? 'x'}`}
                href={social.Url || '#'}
                aria-label={social.Title || 'social link'}
                target={social.Url ? '_blank' : undefined}
                rel={social.Url ? 'noopener noreferrer' : undefined}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#0B2A8E] transition-colors hover:border-[#0B2A8E]/80 overflow-hidden"
                title={social.Title}
              >
                {sSrc && (
                  <Image
                    src={sSrc}
                    alt={sImg?.AlternativeText || social.Title || 'social'}
                    width={20}
                    height={20}
                    sizes="28px"
                    className="object-contain"
                    unoptimized
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {item.HasLabel && (
        <div className="absolute bottom-0 ltr:right-0 rtl:left-0 w-[124px] h-44 bg-primary ltr:rounded-tl-[60px] rtl:rounded-tr-[60px] ">
          <div className="absolute bottom-0 ltr:right-0 rtl:left-0 w-[78px] h-[115px] bg-white"></div>
        </div>
      )}
    </section>
  );
}

