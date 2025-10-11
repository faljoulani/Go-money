import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { SupportInfoBoxEntity } from './supportBox.entity';
import { fetchData } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, firstIdFromSelection, linkToHref } from '../../../utils/utils';
import Description from '../../atoms/description/description';
import Title from '../../atoms/title/title';
import { CmsImage, ImgUrl as imgUrl } from '../../../types/typee';
import Link from 'next/link';
import Image from 'next/image';
import SocialCleint from './socailClient';

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
      'SocialLinks($select=Id,Title,Description,CtaLink,Order,Logo($select=Url,MediaUrl,ThumbnailUrl,AlternativeText,Title))',
    ],
    { itemType: selection?.Content?.[0]?.Type, single: true },
  )) as any | null;

  if (!item) return null;

  const infos = (item.InfoLinks || [])
    .filter((x: any) => x?.IsVisible !== false)
    .sort((a: any, b: any) => (a?.Order ?? 0) - (b?.Order ?? 0));

  let rawCtaUrl: { href?: string }[] = [];

  if (Array.isArray(item.SocialLinks)) {
    for (const social of item.SocialLinks) {
      try {
        if (typeof social.CtaLink === 'string') {
          const parsed = JSON.parse(social.CtaLink);
          if (Array.isArray(parsed)) rawCtaUrl.push(...parsed);
        } else if (Array.isArray(social.CtaLink)) {
          rawCtaUrl.push(...social.CtaLink);
        }
      } catch {
        // ignore invalid CtaLink
      }
    }
  }

  // Map to only hrefs
  const socials = rawCtaUrl.map((link) => link.href).filter(Boolean);
  return (
    <section
      {...attrs}
      className="max-w-[490px] relative flex flex-col items-start justify-between rounded-[20px] h-full bg-surface-input p-4 md:p-10 shadow-sm"
    >
      {/* {item.HasLabel && (
        <div className="absolute bottom-0 ltr:right-0 rtl:left-0 xs:w-[44px] xs:h-[60px] md:w-[124px] md:h-44 bg-primaryAlt md:ltr:rounded-tl-[60px] md:rtl:rounded-tr-[60px] xs:ltr:rounded-tl-[30px] xs:rtl:rounded-tr-[30px]">
          <div className="absolute bottom-0 ltr:right-0 rtl:left-0 xs:w-[20px] xs:h-[30px] md:w-[78px] md:h-[115px] bg-surface-input"></div>
        </div>
      )} */}
      <div className="space-y-4">
        <Title color="text-primary" className="text-2xl font-bold  md:text-28px">
          {item.Title}
        </Title>
        <Description
          color="text-neutral"
          className="text-18px md:font-semibold leading-[100%] tracking-[0]"
          html={item.Description}
        />
      </div>

      {/* Info */}
      <div className="mt-10 space-y-4">
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
                  className="h-8 w-8 object-contain dark:invert"
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
        <div className="mt-12 flex items-center gap-4">
          {socials.map((social: any, i: number) => {
            const sImg = firstMedia(social.Logo);
            const sSrc = imgPath(sImg);

            return (
              <Link
                key={`social-${i}-${social.Title}`}
                href={social || '#'}
                aria-label={social.Title || 'social link'}
                target={social.Url ? '_blank' : undefined}
                rel={social.Url ? 'noopener noreferrer' : undefined}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-primaryAlt  hover:opacity-90 overflow-hidden"
                title={social.Title}
              >
                <SocialCleint url={social} />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

