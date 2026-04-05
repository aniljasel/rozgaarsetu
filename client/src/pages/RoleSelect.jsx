import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Briefcase, User, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RoleSelect = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [settings, setSettings] = React.useState({ workerRegistration: true, customerRegistration: true, maintenanceMode: false });
    const { error } = useToast();

    const [blockedMessage, setBlockedMessage] = React.useState(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (!user.name) {
                navigate(`/${user.role}/profile-setup`, { replace: true });
            } else {
                navigate(`/${user.role}/dashboard`, { replace: true });
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        // Fetch public settings to check registration status
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/settings`);
                const data = await res.json();
                if (data.success && data.settings) {
                    setSettings(data.settings);
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleRoleSelect = (role) => {
        if (settings.maintenanceMode) {
            setBlockedMessage({
                title: language === 'hi' ? "प्लेटफॉर्म मेंटेनेंस" : "Platform Maintenance",
                message: language === 'hi' ? "प्लेटफॉर्म अभी मेंटेनेंस में है। कृपया बाद में प्रयास करें।" : "Platform is currently under maintenance. Please try again later."
            });
            return;
        }

        if (role === 'worker' && !settings.workerRegistration) {
            setBlockedMessage({
                title: language === 'hi' ? "रजिस्ट्रेशन बंद है" : "Registration Closed",
                message: language === 'hi' ? "नए वर्कर का रजिस्ट्रेशन अभी उपलब्ध नहीं है। असुविधा के लिए खेद है।" : "New worker registration is not available at this time. We apologize for the inconvenience."
            });
            return;
        }

        if (role === 'customer' && !settings.customerRegistration) {
            setBlockedMessage({
                title: language === 'hi' ? "रजिस्ट्रेशन बंद है" : "Registration Closed",
                message: language === 'hi' ? "नए ग्राहक का रजिस्ट्रेशन अभी उपलब्ध नहीं है। असुविधा के लिए खेद है।" : "New customer registration is not available at this time. We apologize for the inconvenience."
            });
            return;
        }

        // Navigate to Login with role state
        navigate('/login', { state: { role } });
    };

    return (
        <Layout>
            {blockedMessage && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/40 animate-fade-in">
                    <div className="bg-white rounded-4xl w-full max-w-2xl p-8 md:p-12 shadow-2xl text-center transform animate-scale-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                        
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Briefcase size={40} className="absolute opacity-20 transform -rotate-12 translate-x-3 -translate-y-2" />
                            <User size={40} className="absolute opacity-20 transform rotate-12 -translate-x-3 -translate-y-2" />
                            <div className="relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-red-500 font-black text-2xl">!</span>
                            </div>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{blockedMessage.title}</h2>
                        
                        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
                            {blockedMessage.message}
                        </p>
                        
                        <button
                            onClick={() => setBlockedMessage(null)}
                            className="bg-gray-900 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-gray-900/20"
                        >
                            {language === 'hi' ? 'ठीक है, समझ गया' : 'Okay, I understand'}
                        </button>
                    </div>
                </div>
            )}

            <div className="min-h-[85vh] flex flex-col items-center justify-center bg-linear-to-b from-green-50/50 to-white py-12 px-4 relative z-10">

                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                    <span className="text-green-600 font-bold tracking-wider uppercase mb-2 block text-sm">{t.role.joinRozgaar}</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {t.role.chooseJourney.split(' ').slice(0, -1).join(' ')} <span className="text-green-600">{t.role.chooseJourney.split(' ').slice(-1)}</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        {t.role.journeyDesc}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl px-4">
                    {/* Worker Option */}
                    <div
                        onClick={() => handleRoleSelect('worker')}
                        className="group relative bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Briefcase size={180} className="text-green-600" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                            <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-green-100 transition-colors">
                                <Briefcase size={48} className="text-green-600" />
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.role.worker}</h2>
                            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                                {t.role.workerDesc}
                            </p>

                            <ul className="text-left space-y-3 mb-10 w-full max-w-xs mx-auto text-gray-600">
                                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-500 shrink-0" /> {t.role.fastReg}</li>
                                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-500 shrink-0" /> {t.role.verifiedJobs}</li>
                                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-500 shrink-0" /> {t.role.directPay}</li>
                            </ul>

                            <button className="mt-auto flex items-center gap-2 text-green-700 font-bold text-lg group-hover:gap-4 transition-all">
                                {t.role.workerBtn} <ArrowRight size={24} />
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    {/* Customer Option */}
                    <div
                        onClick={() => handleRoleSelect('customer')}
                        className="group relative bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <User size={180} className="text-blue-600" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-100 transition-colors">
                                <User size={48} className="text-blue-600" />
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.role.customer}</h2>
                            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                                {t.role.customerDesc}
                            </p>

                            <ul className="text-left space-y-3 mb-10 w-full max-w-xs mx-auto text-gray-600">
                                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-blue-500 shrink-0" /> {t.role.instantBooking}</li>
                                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-blue-500 shrink-0" /> {t.role.trustedPros}</li>
                                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-blue-500 shrink-0" /> {t.role.securePlatform}</li>
                            </ul>

                            <button className="mt-auto flex items-center gap-2 text-blue-700 font-bold text-lg group-hover:gap-4 transition-all">
                                {t.role.customerBtn} <ArrowRight size={24} />
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RoleSelect;
