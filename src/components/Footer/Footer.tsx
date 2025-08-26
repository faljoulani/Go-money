'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import * as React from 'react';

type FooterLink = { label: string; href: string };

export default function Footer() {
    const year = new Date().getFullYear();

    const explore: FooterLink[] = [
        { label: 'Home', href: '/' },
        { label: 'Our Finance Products', href: '/products' },
        { label: 'Finance Calculator', href: '/calculator' },
    ];

    const company: FooterLink[] = [
        { label: 'About Us', href: '/about' },
        { label: 'Investor Relations', href: '/investors' },
        { label: 'Careers', href: '/careers' },
    ];

    const support: FooterLink[] = [
        { label: 'FAQ', href: '/faq' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Inquiries & complaints', href: '/complaints' },
    ];

    const legal: FooterLink[] = [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms & conditions', href: '/terms' },
    ];

    return (
        <footer className='relative text-gray-300'>
            {/* Background */}
            <div className='absolute inset-0 -z-10 bg-gradient-to-b from-[#0A0F15] via-[#0B1220] to-[#0A0F15]' />

            <div className='mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 py-16 lg:py-24'>
                {/* Heading */}
                <h2 className='text-white/95 text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl'>
                    Insights That Drive Your
                    <br /> Financial Growth
                </h2>

                {/* Divider */}
                <hr className='my-8 border-white/10' />

                {/* Top grid: brand at left, link columns at right */}
                {/* container */}
                <div className='mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10 py-8'>
                    {/* grid: 5 cols, 32px gap */}
                    <div className='grid md:grid-cols-5 gap-8'>
                        {/* Brand / About -> 1 col */}
                        <div className='md:col-span-1'>
                            <div className='flex items-center gap-3'>
                                <div className='h-[45px] w-[102px] rounded-md flex items-center justify-center bg-gradient-to-b from-[#0A0F15] via-[#0B1220] to-[#0A0F15]'>
                                    <Image
                                        src='/assets/go_money_logo.png'
                                        alt='Go Money logo'
                                        width={102}
                                        height={45}
                                        className='h-[45px] w-[102px] object-contain brightness-0 invert'
                                        priority
                                    />
                                </div>
                            </div>

                            <p className='mt-4 max-w-[260px] font-lufga font-normal text-[12px] leading-[100%] text-gray-300/90 align-middle'>
                                Get instant access to micro-financing that aligns with your values. Quick approval,
                                transparent terms, and a fully digital process.
                            </p>

                            {/* Contact info */}
                            <div className='mt-6 space-y-4 text-sm text-gray-300'>
                                <div className='flex items-center gap-3'>
                                    <Phone className='h-5 w-5 text-primary' />
                                    <span>+966 800-11111-66</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Mail className='h-5 w-5 text-primary' />
                                    <span>support@gomoney.com.sa</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <MapPin className='h-5 w-5 text-primary' />
                                    <span>Riyadh, Saudi Arabia</span>
                                </div>
                            </div>

                            <div className='mt-4 flex items-center gap-4'>
                                <SocialIcon href='#' aria='Go Money on Facebook'>
                                    <Facebook className='h-5 w-5' />
                                </SocialIcon>
                                <SocialIcon href='#' aria='Go Money on Twitter/X'>
                                    <Twitter className='h-5 w-5' />
                                </SocialIcon>
                                <SocialIcon href='#' aria='Go Money on Instagram'>
                                    <Instagram className='h-5 w-5' />
                                </SocialIcon>
                                <SocialIcon href='#' aria='Go Money on LinkedIn'>
                                    <Linkedin className='h-5 w-5' />
                                </SocialIcon>
                            </div>
                        </div>
                        {/* Link columns -> spans 4 cols, 4 equal columns inside */}
                        <div className='md:col-span-4 flex flex-col-reverse sm:flex-row sm:flex-wrap gap-8'>
                            <div className='basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4'>
                                <FooterColumn title='Explore' links={explore} />
                            </div>
                            <div className='basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4'>
                                <FooterColumn title='Our company' links={company} />
                            </div>
                            <div className='basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4'>
                                <FooterColumn title='Support' links={support} />
                            </div>
                            <div className='basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4'>
                                <FooterColumn title='Legal' links={legal} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className='mt-12 mb-6 border-white/10' />

                {/* Bottom row: badges | legal line | copyright (side-by-side on md+) */}
                <div className='flex flex-col gap-6 md:grid md:grid-cols-3 md:items-center'>
                    {/* Left: badges (kept to ~614px as per Figma) */}
                    <div className='flex items-center gap-6 md:w-[614px]'>
                        <Badge src='/icons/sama-logo.svg' label='SAMA Licensed' labelBottom='License #SA-123456' />
                        <Badge
                            src='/icons/sharia-certified.svg'
                            label='Sharia Certified'
                            labelBottom='100% Compliant'
                        />
                    </div>

                    {/* Center: copyright (remains centered, independent of left/right widths) */}
                    <div className='text-center'>
                        <p className='font-[Lufga] font-normal text-[12px] leading-[100%] tracking-[0] text-gray-400'>
                            © {year} Go-money. All rights reserved.
                        </p>
                    </div>

                    {/* Right: legal line (right-aligned on md+) */}
                    <div className='md:justify-self-end'>
                        <div className='font-[Lufga] font-normal text-[12px] leading-[100%] tracking-[0] text-gray-400'>
                            Licensed by SAMA | Sharia Compliant Financing
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ----------------- subcomponents ----------------- */

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
    return (
        <nav aria-label={title} className='flex flex-col'>
            <h3 className='text-white text-lg font-normal font-lufga'>{title}</h3>
            <ul className='mt-4 space-y-3'>
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className='
                                        font-lufga
                                        font-medium
                                        text-[14px]
                                        leading-[100%]
                                        no-underline
                                        text-gray-300
                                        hover:text-primary
                                        transition-colors
                                        align-middle
                                    '
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function SocialIcon({ href, aria, children }: { href: string; aria: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            aria-label={aria}
            className='inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-gray-300 
                       hover:border-primary/40 hover:text-primary transition-colors'
        >
            {children}
        </Link>
    );
}

function Badge({ src, label, labelBottom }: { src: string; label: string; labelBottom: string }) {
    return (
        <div className='flex items-center gap-4'>
            <Image
                src={src}
                alt={label}
                width={160}
                height={64}
                className='h-10 w-auto object-contain shrink-0'
                priority
            />
            <div className='leading-[100%] text-left'>
                <div className='font-lufga font-bold text-[14px] leading-[100%] text-white'>{label}</div>
                <div className='font-lufga font-normal text-[12px] leading-[100%] text-gray-400'>{labelBottom}</div>
            </div>
        </div>
    );
}

