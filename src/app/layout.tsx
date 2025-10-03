// import 'bootstrap/dist/css/bootstrap.css';
import './../index.css';
import 'flag-icons/css/flag-icons.min.css';
import RtlDirection from '../components/customComponents/rtlDirection/rtlDirection';
import { ThemeProvider } from 'next-themes';
<meta name="viewport" content="width=device-width, initial-scale=1.0" />;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // let bootstrapScript = '';
  // if (process.env.NODE_ENV === 'development') {
  //     bootstrapScript = '/assets/bootstrap.bundle.js';
  // } else {
  //     bootstrapScript = '/assets/bootstrap.bundle.min.js';
  // }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="container-fluid">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RtlDirection />
          <div className="px-5">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}

