/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#010663', // Use it with bg-primary, text-primary, border-primary
        secondary: '#0b2a8e',
        default: '#424242', // Use it with bg-default, text-default, border-default
        surface: 'hsla(0, 0%, 100%, 0.75)',
        line: '#e0e0e0',
        bgNeutral200: '#eeeeee',
        skyTint: '#CFE8F1',
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

