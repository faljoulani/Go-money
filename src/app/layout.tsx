// import 'bootstrap/dist/css/bootstrap.css';
import './../index.css';
import 'flag-icons/css/flag-icons.min.css';
import RtlDirection from '../components/customComponents/rtlDirection/rtlDirection';
import { ThemeProvider } from 'next-themes';
import { headers } from 'next/headers';

function extractLangFromPathname(pathname: string): string {
  const defaultCulture = (process.env.NEXT_PUBLIC_DEFAULT_CULTURE || 'en').toLowerCase();
  const supportedLanguages = process.env.NEXT_PUBLIC_SUPPORTED_CULTURES?.split(',')
    .map((lang) => lang.trim().toLowerCase())
    .filter(Boolean) || ['en', 'ar'];

  const firstSegment = pathname.split('/')[1]?.toLowerCase();

  if (firstSegment && supportedLanguages.includes(firstSegment)) {
    return firstSegment;
  }

  return defaultCulture;
}

function isRtlLanguage(lang: string): boolean {
  const rtlCultures = process.env.NEXT_PUBLIC_RTL_CULTURES?.split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean) || ['ar'];

  return rtlCultures.includes(lang.toLowerCase());
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // let bootstrapScript = '';
  // if (process.env.NODE_ENV === 'development') {
  //     bootstrapScript = '/assets/bootstrap.bundle.js';
  // } else {
  //     bootstrapScript = '/assets/bootstrap.bundle.min.js';
  // }

  // Extract language from pathname on server-side to prevent RTL flash
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  const lang = extractLangFromPathname(pathname);
  const isRtl = isRtlLanguage(lang);
  const dir = isRtl ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir} className={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning style={{ ['--grad-dir' as any]: isRtl ? 'to left' : 'to right' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="container-fluid">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RtlDirection />
          <div className="p-4 md:p-5">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}

