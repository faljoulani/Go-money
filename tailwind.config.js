/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primaryAlt: 'var(--color-primary-alt)',
        default: 'var(--color-default)',
        primaryEyebrow: 'var(--color-primary-eyebrow)',
        corner: 'var(--color-corner)',
        bgAlt: 'var(--color-bg-alt)',
        bgAltReverse: 'var(--color-bg-alt-reverse)',
        whiteCta: 'var(--color-white-cta)',
        pdfSection: 'var(--color-pdf-section)',
        pdfText: 'var(--color-pdf-text)',
        bgPdf: 'var(--color-bg-pdf)',
        pdf: 'var(--color-pdf)',
        gradientFrom: 'var(--color-gradient-from)',
        gradientTo: 'var(--color-gradient-to)',
        gradientAFrom: 'var(--color-gradient-a-from)',
        gradientATo: 'var(--color-gradient-a-to)',
        'surface-page': 'var(--surface-page)',
        'surface-section': 'var(--surface-section)',
        'surface-gradient': 'var(--surface-gradient)',
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
        xs: '375px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
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

