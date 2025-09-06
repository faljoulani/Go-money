import Link from 'next/link';
import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { FooterEntity } from './Footer.entity';
import FooterLinks, { FooterLinksGroup } from './FooterLinks';
import { toAbsolute, sortByOrder } from '../../../utils/utils';
import {
  firstMedia,
  getImageSrc,
  pageHref,
  parseSelection,
  fetchData,
  extractSelectionId,
} from '../../../utils/sitefinity';

type FooterGroup = {
  Id: string;
  SectionTitle: string;
  Order?: number;
  Pages: Array<{
    Id: string;
    Title: string;
    UrlName?: string;
    ViewUrl?: string;
    RelativeUrlPath?: string;
    HasChildren?: boolean;
  }>;
};

type Certification = {
  Id: string;
  Title?: string;
  Description?: string;
  description?: string;
  Order?: number;
  Logo?: any | any[] | null;
};

type Social = {
  Id: string;
  Title?: string;
  Url?: string;
  Order?: number;
  Logo?: any | any[] | null;
};

type FooterItem = {
  Id: string;
  Title?: string;
  UrlName?: string;
  Description?: string;
  SubTitle?: string;
  CopyrightText?: string;
  ExtraNote?: string;
  Logo?: any | any[] | null;
  CertificationLinks?: Certification[];
  FooterNavigation?: FooterGroup[];
  SocialLinks?: Social[];
};

export default async function Footer(props: WidgetContext<FooterEntity>) {
  const attrs = htmlAttributes(props);
  const selection = parseSelection((props.model?.Properties as any)?.Footer);
  const { culture, isEdit } = props.requestContext;

  const id = extractSelectionId(selection);
  if (!id) {
    return isEdit ? (
      <footer {...attrs} className="p-4 text-sm text-gray-500">
        Select a Footer item.
      </footer>
    ) : null;
  }

  const FIELDS = [
    'Id',
    'Title',
    'UrlName',
    'Description',
    'SubTitle',
    'CopyrightText',
    'ExtraNote',
    'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)',
    'CertificationLinks($select=Id,Title,description,Order,Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
    'FooterNavigation($select=Id,SectionTitle,Order,Pages($select=Id,Title,UrlName,ViewUrl,RelativeUrlPath,HasChildren))',
    'SocialLinks($select=Id,Title,Url,Order,Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
  ];

  // fetch and NARROW (fetchData may return array or single)
  const raw = await fetchData([id], null, culture, FIELDS, {
    itemType: selection?.Content?.[0]?.Type,
    single: true,
  });

  const item: FooterItem | null = raw
    ? Array.isArray(raw)
      ? ((raw[0] as FooterItem | undefined) ?? null)
      : (raw as FooterItem)
    : null;

  if (!item) {
    return isEdit ? (
      <footer {...attrs} className="p-4 text-sm text-gray-500">
        Couldn’t load the selected Footer item.
      </footer>
    ) : null;
  }

  // helpers for image src
  const imgPath = (img: any | null | undefined) =>
    getImageSrc(img) || img?.MediaUrl || (Array.isArray(img?.Urls) ? img.Urls[0] : null) || null;

  // ---------- map data ----------
  const logoImg = firstMedia(item.Logo);
  const logoSrc = (() => {
    const p = imgPath(logoImg);
    return p ? toAbsolute(p, props.requestContext) : null;
  })();

  const groups: FooterGroup[] = sortByOrder(item.FooterNavigation || []);
  const certifications: Certification[] = sortByOrder(item.CertificationLinks || []);
  const socials: Social[] = sortByOrder(item.SocialLinks || []);

  const year = new Date().getFullYear();
  const copyright = item.CopyrightText || `© ${year} ${item.Title ?? ''}. All rights reserved.`;

  const linkGroups: FooterLinksGroup[] = groups.map((g, gi) => ({
    id: g.Id ?? `grp-${gi}-${g.SectionTitle ?? 'untitled'}`,
    title: g.SectionTitle,
    links: (g.Pages || []).map((p, pi) => ({
      id: p.Id ?? `link-${gi}-${pi}-${p.Title ?? p.UrlName ?? p.RelativeUrlPath ?? 'untitled'}`,
      title: p.Title,
      href: pageHref(p),
    })),
  }));

  // ---------- view ----------
  return (
    <footer {...attrs} className="relative text-gray-300">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0A0F15] via-[#0B1220] to-[#0A0F15]" />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        {(item.Title || item.SubTitle) && (
          <h2 className="text-white/95 text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl">
            {item.Title || item.SubTitle}
          </h2>
        )}

        <hr className="my-8 border-white/10" />

        {/* container */}
        <div className="mx-auto w-full max-w-[1240px] px-5 py-8">
          <div className="flex gap-8">
            <div className="col-span-1">
              <div className="w-[400px] max-w-[400px] h-[423px] border-r border-white/15 flex flex-col gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-[45px] w-[102px] rounded-md flex items-center justify-center bg-gradient-to-b from-[#0A0F15] via-[#0B1220] to-[#0A0F15]">
                    {logoSrc && (
                      <Image
                        src={logoSrc}
                        alt={logoImg?.AlternativeText || logoImg?.Title || 'Footer logo'}
                        width={102}
                        height={45}
                        sizes="102px"
                        className="h-[45px] w-[102px] object-contain brightness-0 invert"
                        priority
                        unoptimized
                      />
                    )}
                  </div>
                </div>

                {item.Description && (
                  <p className="max-w-[260px] font-lufga font-normal text-[14px] leading-[18px] text-gray-300/90">
                    {String(item.Description).replace(/\s+/g, ' ').trim()}
                  </p>
                )}

                {/* Social icons */}
                {socials?.length > 0 && (
                  <div className="flex items-center gap-4">
                    {socials.map((social, i) => {
                      const sImg = firstMedia(social.Logo);
                      const sRaw = imgPath(sImg);
                      const sSrc = sRaw ? toAbsolute(sRaw, props.requestContext) : null;

                      return (
                        <Link
                          key={social.Id ?? `social-${i}-${social.Title ?? 'x'}`}
                          href={social.Url || '#'}
                          aria-label={social.Title || 'social link'}
                          className="inline-flex h-9 w-9 items-center justify-center text-gray-300 hover:border-primary/40 transition-colors overflow-hidden"
                        >
                          {sSrc ? (
                            <Image
                              src={sSrc}
                              alt={sImg?.AlternativeText || social.Title || 'social'}
                              width={20}
                              height={20}
                              sizes="20px"
                              className="h-5 w-5 object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="text-xs">{social.Title?.[0] ?? '#'}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Link columns (FooterNavigation groups) */}
            <FooterLinks groups={linkGroups} className="px-10 text-left" dir="rtl" />
          </div>
        </div>

        <hr className="mt-12 mb-6 border-white/10" />

        {/* Bottom row: certifications | copyright | extra */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:items-center">
          {/* Certifications */}
          <div className="flex items-center gap-6 md:w-[614px] flex-wrap">
            {certifications.map((info, i) => {
              const img = firstMedia(info.Logo);
              const rawSrc = imgPath(img);
              const src = rawSrc ? toAbsolute(rawSrc, props.requestContext) : '/icons/sama.svg';
              const text = info.Description ?? info.description;

              return (
                <div
                  key={info.Id ?? `cert-${i}-${info.Title ?? 'item'}`}
                  className="flex items-center gap-4"
                >
                  <Image
                    src={src}
                    alt={img?.AlternativeText || info.Title || 'certification'}
                    width={160}
                    height={40}
                    sizes="160px"
                    className="h-10 w-auto object-contain shrink-0"
                    priority
                    unoptimized
                  />
                  <div className="flex flex-col gap-2 leading-[100%] text-left">
                    {info.Title && (
                      <div className="font-lufga font-bold text-[14px] leading-[100%] text-white">
                        {info.Title}
                      </div>
                    )}
                    {text && (
                      <div className="font-lufga font-normal text-[12px] leading-[100%] text-white">
                        {text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="font-[Lufga] font-normal text-[12px] leading-[100%] tracking-[0] text-gray-400">
              {copyright}
            </p>
          </div>

          {/* Right side (extra note) */}
          <div className="md:justify-self-end">
            {item.ExtraNote && (
              <div className="font-[Lufga] font-normal text-[12px] leading-[100%] tracking-[0] text-gray-400">
                {String(item.ExtraNote).replace(/"+$/, '')}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

