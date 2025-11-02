/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primaryAlt: 'var(--color-primary-alt)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        bgAlt: 'var(--color-bg-alt)',
        whiteCta:  'var(--color-white-cta)',
        default: 'var(--color-default)',
        expand: 'var(--color-expand)',
        'surface-page': 'var(--surface-page)',
        'surface-section': 'var(--surface-section)',
        'surface-gradient': 'var(--surface-gradient)',
        'surface-sheet': 'var(--surface-sheet)',
        'surface-input': 'var(--surface-input)',
        black: 'var( --color-black)',
        surface: 'hsla(0, 0%, 100%, 0.75)',
        neutral: '#9E9E9E',
        line: '#e0e0e0',
        bgNeutral200: '#eeeeee',
        skyTint: 'var(--color-skyTint-surface)',
        bgLayout: 'var(--color-skyTint-surface)',
        bgPrimary: 'var(--color-background-primary)',
        lineMuted: '#EAEDF3',
      },
      spacing: {
        1.5: '6px', // now you can use p-1.5, px-1.5, py-1.5
      },
      safelist: [{ pattern: /text-(28|32|40)px/ }],
      fontSize: {
        '11px': ['11px', { lineHeight: '100%' }], // enables text-11px
        '14px': ['14px', { lineHeight: '100%' }], //text-14px
        '28px': ['28px', { lineHeight: '100%' }], //text-28px
        '32px': ['32px', { lineHeight: '100%' }], //text-28px
        '40px': ['40px', { lineHeight: '100%' }], //text-40px
      },
      fontFamily: {
        lufga: ['Lufga', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      screens: {
        xs: '300px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        xxl: '1550px',
        xxxl:'2100px'
      },
      backgroundImage: {
        'finance-banner': 'linear-gradient(97.8deg, #010663 0%, #6BE5BF 100%)',
        'finance-banner-dark': 'linear-gradient(97.8deg, #000226 0%, #054E42 100%)',
      },
    },
  },
  plugins: [],
};

/**
 * 
 * 
 * 

48px → ✅ text-5xl

18px → ✅ text-lg

16px → ✅ text-base

32px → ❌ not built-in (closest is text-3xl = 30px or text-4xl = 36px)

28px → ❌ not built-in (closest is text-2xl = 24px or text-3xl = 30px)

40px → ❌ not built-in (closest is text-4xl = 36px or text-5xl = 48px)

20px → ✅ text-xl

12px → ✅ text-xs
 * 
 * 
 * 
 */

