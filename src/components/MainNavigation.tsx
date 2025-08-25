'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import AppLink from './ui/AppLink';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface BaseNavItem {
    label: string;
    href: string;
}
export interface NavLink extends BaseNavItem {}
export interface NavDropdown extends BaseNavItem {
    children: NavLink[];
}
export type NavItem = NavLink | NavDropdown;

export const NAV: NavItem[] = [
    { label: 'Home', href: '/' },
    {
        label: 'About',
        href: '/about',
        children: [
            { label: 'Company', href: '/about/company' },
            { label: 'Leadership', href: '/about/leadership' },
            { label: 'Press', href: '/about/press' },
        ],
    },
    {
        label: 'Our Products',
        href: '/products',
        children: [
            { label: 'Cards', href: '/products/cards' },
            { label: 'Payments', href: '/products/payments' },
            { label: 'Insights', href: '/products/insights' },
        ],
    },
    {
        label: 'Help',
        href: '/help',
        children: [
            { label: 'Support Center', href: '/help/support' },
            { label: 'FAQ', href: '/help/faq' },
        ],
    },
    { label: 'Careers', href: '/careers' },
];

function Logo() {
    return (
        <Link href='/' className='flex items-center gap-2'>
            <Image
                src='/assets/logo.png'
                alt='Go Money Logo'
                width={102}
                height={45}
                priority
                className='opacity-100'
            />
        </Link>
    );
}

function NavItem({ item, active }: { item: NavItem; active: boolean }) {
    const pathname = usePathname() ?? '';
    const [open, setOpen] = useState(false);
    const hasChildren = 'children' in item && Array.isArray(item.children);

    return (
        <div className='relative group'>
            <AppLink
                href={item.href}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className={[
                    'px-3 py-2 text-sm font-medium inline-flex items-center gap-1 no-underline transition-colors',
                    active ? 'text-[#010663]' : 'text-gray-800 hover:text-primary',
                ].join(' ')}
            >
                {item.label}
                {hasChildren && <ChevronDown className='h-4 w-4 opacity-70' />}
            </AppLink>

            {/* Active underline */}
            {active && <div className='absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary' />}

            {/* Dropdown */}
            {hasChildren && (
                <div
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                    className={[
                        'absolute top-full left-0 mt-2 min-w-[220px] rounded-xl border border-black/5 bg-white p-2 shadow-xl transition',
                        open ? 'opacity-100 visible' : 'opacity-0 invisible',
                    ].join(' ')}
                >
                    {item.children!.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={`block rounded-lg px-3 py-2 text-sm no-underline ${
                                    childActive ? 'text-primary bg-slate-50' : 'text-gray-700 hover:bg-slate-50'
                                }`}
                            >
                                {child.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function DesktopNav() {
    const pathname = usePathname();

    return (
        <nav className='hidden lg:flex items-center gap-1'>
            {NAV.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return <NavItem key={item.href} item={item} active={active} />;
            })}
        </nav>
    );
}

function StoreIcons() {
    return (
        <div className='w-[136px] h-10 opacity-100 flex items-center justify-between gap-2'>
            {/* Apple */}
            <a
                href='https://apps.apple.com/app/idXXXXXXXX'
                target='_blank'
                rel='noreferrer'
                className='w-10 h-10 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center hover:bg-slate-200'
                aria-label='App Store'
            >
                <Image src='/icons/apple-store.svg' alt='Apple Store' width={20} height={20} />
            </a>

            {/* Google Play */}
            <a
                href='https://play.google.com/store/apps/details?id=XXXXXXXX'
                target='_blank'
                rel='noreferrer'
                className='w-10 h-10 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center hover:bg-slate-200'
                aria-label='Google Play'
            >
                <Image src='/icons/play-store.svg' alt='Google Play' width={20} height={20} />
            </a>

            {/* Huawei AppGallery */}
            <a
                href='https://appgallery.huawei.com/'
                target='_blank'
                rel='noreferrer'
                className='w-10 h-10 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center hover:bg-slate-200'
                aria-label='Huawei AppGallery'
            >
                <Image src='/icons/huawei-store.svg' alt='Huawei AppGallery' width={20} height={20} />
            </a>
        </div>
    );
}

function RightControls() {
    const [dark, setDark] = useState<boolean>(false);
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const isDark = saved === 'dark';
        setDark(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);
    const toggleTheme = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };
    const [langOpen, setLangOpen] = useState(false);
    const [lang, setLang] = useState<'En' | 'Ar'>('En');
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = (localStorage.getItem('lang') as 'En' | 'Ar') || 'En';
        setLang(saved);
    }, []);
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);
    const chooseLang = (val: 'En' | 'Ar') => {
        setLang(val);
        setLangOpen(false);
        localStorage.setItem('lang', val);
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: val } }));
    };
    return (
        <div className='flex items-center gap-4'>
            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                aria-label='Toggle theme'
                className='grid h-9 w-9 place-items-center text-slate-800 hover:bg-slate-200'
            >
                <Image src='/icons/moon.svg' alt='Apple Store' width={20} height={20} />
            </button>

            {/* Language dropdown */}
            <div className='relative' ref={langRef}>
                <button
                    onClick={() => setLangOpen((v) => !v)}
                    className='hidden sm:inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm text-[#424242] hover:bg-slate-100'
                    aria-haspopup='listbox'
                    aria-expanded={langOpen}
                >
                    {lang} <ChevronDown className='h-4 w-4' />
                </button>

                {langOpen && (
                    <div
                        className='absolute right-0 z-40 mt-2 w-28 rounded-xl border border-black/5 bg-white p-1 shadow-xl'
                        role='listbox'
                    >
                        {(['En', 'Ar'] as const).map((l) => (
                            <button
                                key={l}
                                onClick={() => chooseLang(l)}
                                className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-100 ${
                                    lang === l ? 'text-primary' : 'text-[#424242]'
                                }`}
                                role='option'
                                aria-selected={lang === l}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Divider */}
            <span className='hidden sm:inline-block h-6 w-px bg-black/10' aria-hidden />
            <StoreIcons />
        </div>
    );
}

export default function MainNavigation() {
    return (
        <header className='sticky top-0 z-50 w-full bg-white'>
            <div
                className='mx-auto flex h-[76px] max-w-[1440px] items-center justify-between 
                            bg-white/40 backdrop-blur-[20px] px-8 py-4'
            >
                <div className='flex h-[76px] w-full max-w-[1440px] items-center justify-between bg-white px-8 py-4'>
                    {/* Left: Logo */}
                    <div className='flex items-center gap-3'>
                        <Logo />
                    </div>
                    {/* Center: Nav (desktop) */}
                    <div className='text-red-500'>
                        <DesktopNav />
                    </div>
                    {/* Right: Icons */}
                    <div>
                        <RightControls />
                    </div>
                </div>
            </div>
        </header>
    );
}

