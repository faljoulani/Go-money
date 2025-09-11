// import 'bootstrap/dist/css/bootstrap.css';
import './../index.css';
import RtlDirection from '../components/RtlDirection';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // let bootstrapScript = '';
  // if (process.env.NODE_ENV === 'development') {
  //     bootstrapScript = '/assets/bootstrap.bundle.js';
  // } else {
  //     bootstrapScript = '/assets/bootstrap.bundle.min.js';
  // }

  return (
    <html lang="en">
      <body className="container-fluid">
        <RtlDirection />
        <div className="px-5">{children}</div>
      </body>
    </html>
  );
}
