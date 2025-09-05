import Link from 'next/link';
import Image from 'next/image';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { FooterEntity } from './Footer.entity';
import { CmsImage } from '../../../types/Type';

type CmsPage = {
    Id: string;
    Title: string;
    UrlName?: string;
    ViewUrl?: string;
    RelativeUrlPath?: string;
    HasChildren?: boolean;
};

type FooterGroup = {
    Id: string;
    SectionTitle: string;
    Order?: number;
    Pages: CmsPage[];
};

type Certification = {
    Id: string;
    Title?: string;
    /** API sometimes returns 'description' (lowercase) */
    Description?: string;
    description?: string;
    Order?: number;
    Logo?: CmsImage | CmsImage[] | null;
};

type Social = {
    Id: string;
    Title?: string;
    Url?: string;
    Order?: number;
    Logo?: CmsImage | CmsImage[] | null;
};

const FOOTER_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.Footer.Footer';

export async function Footer(props: WidgetContext<FooterEntity>) {
    const attrs = htmlAttributes(props);

    // ---- read designer selection (supports both shapes) ----
    let selection: any = props.model?.Properties?.Footer ?? (props.model?.Properties as any)?.Footer;

    if (typeof selection === 'string') {
        try {
            selection = JSON.parse(selection);
        } catch {
            selection = undefined;
        }
    }

    const id = selection?.Content?.[0]?.ItemIdsOrdered?.[0] ?? selection?.ItemIdsOrdered?.[0] ?? null;

    const provider = selection?.Content?.[0]?.Provider ?? selection?.Provider ?? undefined;

    if (!id) {
        // Edit-mode hint; otherwise render nothing
        if (props.requestContext.isEdit) {
            return (
                <footer {...attrs} className='p-4 text-sm text-gray-500'>
                    Select a Footer item.
                </footer>
            );
        }
        return null;
    }

    // ---- fetch footer item ----
    let item: any | undefined;
    try {
        item = await RestClient.getItem({
            id,
            provider,
            type: FOOTER_TYPE,
            culture: props.requestContext.culture,
            traceContext: props.traceContext,
            fields: [
                'Id',
                'Title',
                'UrlName',
                'Description',
                'SubTitle',
                'CopyrightText',
                'ExtraNote',
                'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)',
                'CertificationLinks($select=Id,Title,description,Order,' +
                    'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
                'FooterNavigation($select=Id,SectionTitle,Order,' +
                    'Pages($select=Id,Title,UrlName,ViewUrl,RelativeUrlPath,HasChildren))',
                'SocialLinks($select=Id,Title,Url,Order,' +
                    'Logo($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider))',
            ],
        });

        // helpful when debugging serverside
        console.log('Server Footer Items:', JSON.stringify(item));
    } catch (e) {
        console.error('Error fetching footer:', e);
    }

    if (!item) {
        if (props.requestContext.isEdit) {
            return (
                <footer {...attrs} className='p-4 text-sm text-gray-500'>
                    Couldn’t load the selected Footer item.
                </footer>
            );
        }
        return null;
    }

    // ---------- helpers(to get one consistent object back) ----------
    const pickOneMedia = (arr: CmsImage | CmsImage[] | null | undefined): CmsImage | null => {
        const media = Array.isArray(arr) ? arr[0] : arr;

        if (!media) return null;

        return {
            Id: media.Id,
            Title: media.Title,
            Url: media.Url ?? media.MediaUrl,
            MediaUrl: media.MediaUrl,
            ThumbnailUrl: media.ThumbnailUrl,
            EmbedUrl: media.EmbedUrl,
            AlternativeText: media.AlternativeText,
            Urls: media.Urls,
            Provider: media.Provider,
        };
    };

    const sortByOrder = <T extends { Order?: number }>(arr: T[] = []) =>
        arr.slice().sort((a, b) => (a?.Order ?? 0) - (b?.Order ?? 0));

    const pageHref = (p: CmsPage) => p.RelativeUrlPath || p.ViewUrl || `/${p.UrlName ?? ''}`;

    // Footer.view.tsx

    // ...imports & type defs

    // ---- helpers ----
    const getImageSrc = (img?: CmsImage | null): string | null => {
        if (!img) return null;
        const src = img.MediaUrl || img.Url || img.EmbedUrl || null;
        if (!src) return null;
        if (src.startsWith('http')) return src;
        return src.startsWith('/') ? src : `/${src}`;
    };

    const firstMedia = (val: CmsImage | CmsImage[] | null | undefined): CmsImage | null =>
        Array.isArray(val) ? (val[0] ?? null) : (val ?? null);

    // ---------- map data safely ----------
    //sconst logo = pickOneMedia(item.Logo);
    const logoImg = firstMedia(item.Logo);
    const logoSrc = getImageSrc(logoImg);
    const groups: FooterGroup[] = sortByOrder(item.FooterNavigation || []);
    const certifications: Certification[] = sortByOrder(item.CertificationLinks || []);
    const socials: Social[] = sortByOrder(item.SocialLinks || []);

    const year = new Date().getFullYear();
    const copyright = item.CopyrightText || `© ${year} ${item.Title ?? ''}. All rights reserved.`;

    // ---------- view ----------
    return (
        <footer {...attrs} className='relative text-gray-300'>
            {/* Background gradient */}
            <div className='absolute inset-0 -z-10 bg-gradient-to-b from-[#0A0F15] via-[#0B1220] to-[#0A0F15]' />

            <div className='mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 py-16 lg:py-24'>
                {/* Heading (Title/SubTitle) */}
                {(item.Title || item.SubTitle) && (
                    <h2 className='text-white/95 text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl'>
                        {item.Title}
                        {/* {item.SubTitle && (
                            <>
                                <br />
                                {item.SubTitle}
                            </>
                        )} */}
                    </h2>
                )}

                <hr className='my-8 border-white/10' />

                {/* container */}
                <div className='mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10 py-8'>
                    <div className='grid md:grid-cols-5 gap-8'>
                        {/* Brand / About */}
                        <div className='md:col-span-1'>
                            <div className='flex items-center gap-3'>
                                <div className='h-[45px] w-[102px] rounded-md flex items-center justify-center bg-gradient-to-b from-[#0A0F15] via-[#0B1220] to-[#0A0F15]'>
                                    {logoSrc && (
                                        <Image
                                            src={logoSrc}
                                            alt={logoImg?.AlternativeText || logoImg?.Title || 'Footer logo'}
                                            width={102}
                                            height={45}
                                            sizes='102px'
                                            className='h-[45px] w-[102px] object-contain'
                                            priority
                                        />
                                    )}
                                </div>
                            </div>

                            {item.Description && (
                                <p className='mt-4 max-w-[260px] font-lufga font-normal text-[12px] leading-[140%] text-gray-300/90'>
                                    {item.Description}
                                </p>
                            )}

                            {/* Social icons */}
                            {socials?.length > 0 && (
                                <div className='mt-4 flex items-center gap-4'>
                                    {socials.map((s) => {
                                        const sImg = firstMedia(s.Logo);
                                        const sSrc = getImageSrc(sImg);

                                        return (
                                            <Link
                                                key={s.Id}
                                                href={s.Url || '#'}
                                                aria-label={s.Title || 'social link'}
                                                className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-gray-300 hover:border-primary/40 hover:text-primary transition-colors overflow-hidden'
                                            >
                                                {sSrc ? (
                                                    <Image
                                                        src={sSrc}
                                                        alt={sImg?.AlternativeText || s.Title || 'social'}
                                                        width={20}
                                                        height={20}
                                                        sizes='20px'
                                                        className='h-5 w-5 object-contain'
                                                    />
                                                ) : (
                                                    <span className='text-xs'>{s.Title?.[0] ?? '#'}</span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Link columns (FooterNavigation groups) */}
                        <div className='md:col-span-4 flex flex-col-reverse sm:flex-row sm:flex-wrap gap-8'>
                            {groups.map((g) => (
                                <div key={g.Id} className='basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4'>
                                    <nav aria-label={g.SectionTitle} className='flex flex-col'>
                                        <h3 className='text-white text-lg font-normal font-lufga'>{g.SectionTitle}</h3>
                                        <ul className='mt-4 space-y-3'>
                                            {(g.Pages || []).map((p) => (
                                                <li key={p.Id}>
                                                    <Link
                                                        href={pageHref(p)}
                                                        className='font-lufga font-medium text-[14px] leading-[100%] no-underline text-gray-300 hover:text-primary transition-colors align-middle'
                                                    >
                                                        {p.Title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <hr className='mt-12 mb-6 border-white/10' />

                {/* Bottom row: certifications | copyright | extra note (right) */}
                <div className='flex flex-col gap-6 md:grid md:grid-cols-3 md:items-center'>
                    {/* Certifications */}
                    <div className='flex items-center gap-6 md:w-[614px] flex-wrap'>
                        {certifications.map((info) => {
                            const img = firstMedia(info.Logo);
                            const src = getImageSrc(img) ?? '/icons/sama.svg'; // local fallback in /public/icons
                            const text = info.Description ?? info.description;

                            return (
                                <div key={info.Id} className='flex items-center gap-4'>
                                    <Image
                                        src={src}
                                        alt={img?.AlternativeText || info.Title || 'certification'}
                                        width={160}
                                        height={40}
                                        sizes='160px'
                                        className='h-10 w-auto object-contain shrink-0'
                                        priority
                                    />
                                    <div className='leading-[100%] text-left'>
                                        {info.Title && (
                                            <div className='font-lufga font-bold text-[14px] leading-[100%] text-white'>
                                                {info.Title}
                                            </div>
                                        )}
                                        {text && (
                                            <div className='font-lufga font-normal text-[12px] leading-[100%] text-gray-400'>
                                                {text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Copyright */}
                    <div className='text-center'>
                        <p className='font-[Lufga] font-normal text-[12px] leading-[100%] tracking-[0] text-gray-400'>
                            {copyright}
                        </p>
                    </div>

                    {/* Right side (placeholder for any extra line, fallback to SubTitle) */}
                    <div className='md:justify-self-end'>
                        {item.ExtraNote && (
                            <div className='font-[Lufga] font-normal text-[12px] leading-[100%] tracking-[0] text-gray-400'>
                                {item.ExtraNote}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

