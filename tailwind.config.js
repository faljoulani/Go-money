/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        textPrimary: 'var(--text-primary)',
        textDefault: 'var(--text-default)',
        surface: 'var(--bg-white-opacity-75)',
        line: 'var(--line-default)',
        bgNeutral200: 'var(--Background-background-neutral-200)',
      },
      fontSize: {
        head: ['14px', { lineHeight: '100%', fontWeight: '500' }], // use text-head
        section: ['32px', { lineHeight: '40px', fontWeight: '600' }], // use text-section
        body: ['18px', { lineHeight: '28px', fontWeight: '400' }], // use text-body
        small: ['14px', { lineHeight: '20px', fontWeight: '400' }], // use text-small
      },
      fontFamily: {
        lufga: ['Lufga', 'sans-serif'],
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
    },
  },
  plugins: [],
};

