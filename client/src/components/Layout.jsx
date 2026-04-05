import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const location = useLocation();

    // List of routes where footer should be hidden
    const hideFooterPrefixes = ['/worker', '/customer', '/admin'];
    const shouldHideFooter = hideFooterPrefixes.some(prefix => location.pathname.startsWith(prefix));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="grow pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {children}
            </main>
            {!shouldHideFooter && <Footer />}
        </div>
    );
};

export default Layout;
