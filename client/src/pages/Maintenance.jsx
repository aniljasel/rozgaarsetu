import React from 'react';
import { Settings, Wrench, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Maintenance = () => {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Decorative Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl animate-fade-in-up">
                
                {/* Icons Animation */}
                <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-full h-full bg-slate-800 rounded-full border border-white/10 flex items-center justify-center shadow-inner">
                        <Settings size={48} className="text-indigo-400 absolute animate-spin-slow" style={{ animationDuration: '4s' }} />
                        <Wrench size={32} className="text-blue-400 absolute transform translate-x-3 -translate-y-3" />
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    {language === 'hi' ? 'प्लेटफॉर्म मेंटेनेंस में है' : 'Under Maintenance'}
                </h1>
                
                <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto">
                    {language === 'hi' 
                        ? 'हम आपके अनुभव को बेहतर बनाने के लिए वर्तमान में सिस्टम अपडेट कर रहे हैं। कृपया कुछ समय बाद वापस आएं।' 
                        : 'We are currently updating the system to improve your experience. Please check back shortly.'}
                </p>

                {/* Subtext */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-white/5 text-slate-300 text-sm font-medium">
                    <RefreshCcw size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
                    {language === 'hi' 
                        ? 'यह पेज अपने आप रीलोड हो जाएगा' 
                        : 'This page will auto-reload when ready'}
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
