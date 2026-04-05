import React, { useState } from 'react';
import { Menu, X, Globe, Briefcase, Users, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
    const { language: lang, toggleLanguage: toggleLang, t } = useLanguage();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        setIsOpen(false);
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut size={26} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
                                <p className="text-gray-500 text-sm mt-1">Are you sure you want to log out of your account?</p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors cursor-pointer shadow-lg shadow-red-200"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed top-0 left-0 w-full z-100 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">

                        {/* Logo */}
                        <button onClick={() => {
                            if (user) {
                                if (user.name) {
                                    navigate(`/${user.role}/dashboard`);
                                } else {
                                    navigate(`/${user.role}/profile-setup`);
                                }
                            } else {
                                navigate('/');
                            }
                        }} className="flex items-center gap-3 group bg-transparent border-none outline-none cursor-pointer">
                            <img src={logo} alt="Logo" className="h-12 w-12 md:h-16 md:w-16 object-contain transition-transform group-hover:scale-105" />
                            <span className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                                <span className="text-green-600">Rozgaar</span>Setu
                            </span>
                        </button>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="flex items-center gap-4 mr-4 border-r border-gray-200 pr-4">
                                {user?.role !== 'customer' && (
                                    <button onClick={() => navigate(user ? '/worker/dashboard' : '/login', { state: { role: 'worker' } })} className="flex items-center gap-2 text-gray-600 font-bold hover:text-green-600 transition-colors cursor-pointer bg-transparent border-none outline-none">
                                        <Briefcase size={20} />
                                        <span>{t.navbar.jobs}</span>
                                    </button>
                                )}
                                {user?.role !== 'worker' && (
                                    <button onClick={() => navigate(user ? '/customer/dashboard' : '/login', { state: { role: 'customer' } })} className="flex items-center gap-2 text-gray-600 font-bold hover:text-green-600 transition-colors cursor-pointer bg-transparent border-none outline-none">
                                        <Users size={20} />
                                        <span>{t.navbar.workers}</span>
                                    </button>
                                )}
                            </div>

                            <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600 transition-all font-medium text-sm cursor-pointer">
                                <Globe size={16} />
                                <span>{lang === 'hi' ? 'हिंदी' : 'English'}</span>
                            </button>

                            {user ? (
                                <div className="flex items-center gap-4">
                                    <Button onClick={() => navigate(`/${user.role}/dashboard`)} variant="outline" className="py-2.5">
                                        {t.navbar.dashboard}
                                    </Button>
                                    <Button onClick={handleLogoutClick} variant="primary" className="py-2.5">
                                        {t.navbar.logout}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="px-5 py-2.5 rounded-xl text-gray-700 font-bold hover:bg-green-50 hover:text-green-600 transition-colors">
                                        {t.landing.login}
                                    </Link>
                                    <Button onClick={() => navigate('/role-select')} variant="primary" className="py-2.5">
                                        {t.landing.start}
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center">
                            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                {isOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 p-4 flex flex-col gap-4 shadow-lg absolute w-full left-0 z-40 animate-in slide-in-from-top-2">
                        <div className="flex flex-col gap-3 pb-4 border-b border-gray-100">
                            {user?.role !== 'customer' && (
                                <button onClick={() => { setIsOpen(false); navigate(user ? '/worker/dashboard' : '/login', { state: { role: 'worker' } }); }} className="flex items-center justify-between px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-700 font-medium hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors cursor-pointer outline-none">
                                    <span className="flex items-center gap-2"><Briefcase size={20} /> {t.navbar.jobs}</span>
                                </button>
                            )}
                            {user?.role !== 'worker' && (
                                <button onClick={() => { setIsOpen(false); navigate(user ? '/customer/dashboard' : '/login', { state: { role: 'customer' } }); }} className="flex items-center justify-between px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-700 font-medium hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors cursor-pointer outline-none">
                                    <span className="flex items-center gap-2"><Users size={20} /> {t.navbar.workers}</span>
                                </button>
                            )}
                        </div>

                        <button onClick={toggleLang} className="flex items-center justify-between px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-700 font-medium">
                            <span className="flex items-center gap-2"><Globe size={20} /> {t.navbar.changeLanguage}</span>
                            <span className="font-bold text-green-600">{lang.toUpperCase()}</span>
                        </button>

                        <div className="flex flex-col gap-3 mt-2">
                            {user ? (
                                <>
                                    <Button onClick={() => { navigate(`/${user.role}/dashboard`); setIsOpen(false); }} variant="outline" className="w-full py-3 text-lg border-2 border-green-500 text-green-700 font-bold shadow-sm hover:bg-green-50">
                                        {t.navbar.dashboard}
                                    </Button>
                                    <Button onClick={handleLogoutClick} variant="primary" className="w-full py-3 text-lg bg-red-500 hover:bg-red-600 shadow-red-500/30">
                                        {t.navbar.logout}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="px-4 py-3 rounded-xl border border-gray-200 text-center font-bold text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                                        {t.landing.login}
                                    </Link>
                                    <Button onClick={() => { navigate('/role-select'); setIsOpen(false); }} variant="primary" className="w-full py-3 text-lg">
                                        {t.landing.start}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;
