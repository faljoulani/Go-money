import Link from 'next/link';
import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { FooterEntity } from './Footer.entity';
import FooterLinks, { FooterLinksGroup } from './FooterLinks';
import { resolveAbsoluteUrl, sortByOrder, resolveSitefinitySelection } from '../../../utils/utils';
import {
  selectPrimaryImage,
  getImageSrc,
  pageHref,
  fetchData,
  extractSelectionId,
} from '../../../utils/sitefinity';
import Title from '../../atoms/title/title';

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
    Order?: number;
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
  const selection = resolveSitefinitySelection((props.model?.Properties as any)?.Footer);
  const { culture, isEdit } = props.requestContext;

  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>Select a Footer item.</strong>
        <div className="mt-1">Open the designer and select the desired item.</div>
      </section>
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
    'FooterNavigation($select=Id,SectionTitle,Order,Pages($select=Id,Title,UrlName,ViewUrl,Order,RelativeUrlPath,HasChildren))',
    'SocialLinks($select=Id,Title,Url,Order,Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
  ];

  const footerPayload = await fetchData([id], null, culture, FIELDS, {
    itemType: selection?.Content?.[0]?.Type,
    single: true,
  });

  const footerData: FooterItem | null = footerPayload
    ? Array.isArray(footerPayload)
      ? ((footerPayload[0] as FooterItem | undefined) ?? null)
      : (footerPayload as FooterItem)
    : null;

  if (!footerData) {
    return isEdit ? (
      <footer {...attrs} className="p-4 text-sm text-gray-500">
        Couldn’t load the selected Footer item.
      </footer>
    ) : null;
  }

  const logoImg = selectPrimaryImage(footerData.Logo);
  const logoSrc = (() => {
    const url = getImageSrc(logoImg);
    return url ? resolveAbsoluteUrl(url, props.requestContext) : null;
  })();

  const certifications: Certification[] = sortByOrder(footerData.CertificationLinks || []);
  const socials: Social[] = sortByOrder(footerData.SocialLinks || []);

  const FooterNav: FooterGroup[] = sortByOrder(footerData.FooterNavigation || []);

  const linkGroups: FooterLinksGroup[] = FooterNav.map((nav, gIndex) => ({
    id: nav.Id ?? `grp-${gIndex}-${nav.SectionTitle ?? 'untitled'}`,
    title: nav.SectionTitle,
    links: sortByOrder(nav.Pages || []).map((page, pIndex) => ({
      id:
        page.Id ??
        `link-${gIndex}-${pIndex}-${page.Title ?? page.UrlName ?? page.RelativeUrlPath ?? 'untitled'}`,
      title: page.Title,
      href: pageHref(page),
    })),
  }));

  return (
    <section {...attrs} className="relative [perspective:1000px] overflow-x-clip">
      <footer className=" text-gray-300 h-auto flip">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0A0F15] via-[#0B1220] to-[#0A0F15] rounded-[30px]" />
        <img
          src="/assets/footer.png"
          alt=""
          className="absolute overflow-hidden bottom-0 left-0 rounded-b-[30px] z-0"
        />
        <div className="ltr:px-20 ltr:py-16 rtl:px-16 rtl:py-16">
          {(footerData.Title || footerData.SubTitle) && (
            <Title
              color="text-white"
              className="text-40px max-w-[500px] leading-[60px] tracking-[-0.02em]"
            >
              {footerData.Title || footerData.SubTitle}
            </Title>
          )}

          <hr className="border-[#FFFFFF40] mt-8" />

          {/* container */}
          <div className="mx-auto w-full">
            <div className="flex w-auto">
              <div className="col-span-1 mr-16">
                <div className=" h-[423px] max-w-[400px] ltr:border-r ltr:border-white/15 rtl:border-l rtl:border-white/15 flex flex-col gap-8 ltr:pr-14 rtl:pl-14">
                  <div className="flex items-center gap-3">
                    <div className="h-[45px] w-[102px] rounded-md flex items-center justify-center bg-gradient-to-b from-[#0A0F15] via-[#0B1220] to-[#0A0F15] mt-8">
                      {logoSrc && (
                        <Image
                          src={footerData.Logo?.Urls?.[0] || logoSrc}
                          alt={footerData.Logo?.Title || 'Footer logo'}
                          width={100}
                          height={45}
                          className="
                            max-w-[100px] 
                            max-h-[45px] 
                            object-contain
                            invert brightness-0
                          "
                          priority
                          unoptimized
                        />
                      )}
                    </div>
                  </div>

                  {footerData.Description && (
                    <p className="max-w-[400px] font-normal text-[14px] leading-[18px] text-gray-300/90">
                      {String(footerData.Description).replace(/\s+/g, ' ').trim()}
                    </p>
                  )}

                  {/* Social icons */}
                  {socials?.length > 0 && (
                    <div className="flex items-center gap-8">
                      {socials.map((social, i) => {
                        const sImg = selectPrimaryImage(social.Logo);
                        const sRaw = getImageSrc(sImg);
                        const sSrc = sRaw ? resolveAbsoluteUrl(sRaw, props.requestContext) : null;

                        return (
                          <Link
                            key={social.Id ?? `social-${i}-${social.Title ?? 'x'}`}
                            href={social.Url || '#'}
                            aria-label={social.Title || 'social link'}
                            className="inline-flex h-5 w-5 items-center justify-center text-gray-300 hover:border-primary/40 transition-colors overflow-hidden"
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
              <FooterLinks groups={linkGroups} className=" justify-start mt-8 z-20 rtl:pr-16" />
            </div>
          </div>

          <hr className="mb-8 border-white/10" />

          {/* Bottom row: certifications | copyright | extra */}
          <div className="relative flex flex-col gap-6 md:grid md:grid-cols-3 md:items-center">
            {/* Certifications */}
            <div className="flex items-center gap-6 md:w-[614px] flex-wrap">
              {certifications.map((info, i) => {
                const img = selectPrimaryImage(info.Logo);
                const rawSrc = getImageSrc(img);
                const src = rawSrc
                  ? resolveAbsoluteUrl(rawSrc, props.requestContext)
                  : '/icons/sama.svg';
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
                    <div className="flex flex-col gap-2 leading-[100%] justify-start">
                      {info.Title && (
                        <div className="font-bold text-[14px] leading-[100%] text-white">
                          {info.Title}
                        </div>
                      )}
                      {text && (
                        <div className="font-normal text-[12px] leading-[100%] text-white">
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
              <p className="font-normal text-[12px] leading-[100%] tracking-[0] text-[#E0E0E0]">
                {footerData.CopyrightText}
              </p>
            </div>

            {/* Right side (extra note) */}
            <div className="md:justify-self-end">
              {footerData.ExtraNote && (
                <div className="font-normal text-[12px] leading-[100%] tracking-[0] text-[#E0E0E0]">
                  {String(footerData.ExtraNote).replace(/"+$/, '')}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}

