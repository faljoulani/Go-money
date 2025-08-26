// import 'bootstrap/dist/css/bootstrap.css';
import './../index.css';
import MainNavigation from '../components/MainNavigation/MainNavigation';
import Footer from '../components/Footer/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    // let bootstrapScript = '';
    // if (process.env.NODE_ENV === 'development') {
    //     bootstrapScript = '/assets/bootstrap.bundle.js';
    // } else {
    //     bootstrapScript = '/assets/bootstrap.bundle.min.js';
    // }

    return (
        <html lang='en'>
            <body className='container-fluid'>
                <MainNavigation />
                {children}
                <Footer />
            </body>
        </html>
    );
}

