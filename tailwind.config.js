/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)', // Use it with bg-primary, text-primary, border-primary
        secondary: 'var(--color-secondary)',
        default: 'var(--text-default)', // Use it with bg-default, text-default, border-default
        surface: 'var(--bg-white-opacity-75)',
        line: 'var(--line-default)',
        bgNeutral200: 'var(--Background-background-neutral-200)',
        skyTint: '#CFE8F1',
        lineMuted: '#EAEDF3',
      },
      safelist: [{ pattern: /text-(28|32|40)px/ }],
      fontSize: {
        '14px': ['14px', { lineHeight: '100%' }], //text-14px
        '28px': ['28px', { lineHeight: '100%' }], //text-28px
        '32px': ['32px', { lineHeight: '100%' }], //text-28px
        '40px': ['40px', { lineHeight: '100%' }], //text-40px
      },
      fontFamily: {
        lufga: ['Lufga', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      },
      height: {
        header: '76px', // use h-header
        hero: '600px', // use h-hero
        card: '320px', // use h-card
      },
      maxWidth: {
        container: '1440px', // use max-w-container
      },
      transitionProperty: {
        surface: 'background-color, backdrop-filter, color',
      },
      keyframes: {
        flipInX: {
          '0%': { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },
        flipInY: {
          '0%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
      },
      animation: {
        'flip-in-x': 'flipInX 800ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'flip-in-y': 'flipInY 800ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
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

