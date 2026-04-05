import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check } from 'lucide-react';

const LanguagePopup = () => {
    const { hasSelectedLanguage, setLanguage, language } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [selectedLang, setSelectedLang] = useState(language || 'en');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!hasSelectedLanguage) {
            // Small delay for entrance animation
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, [hasSelectedLanguage]);

    if (hasSelectedLanguage && !isVisible) return null;

    const handleLanguageSelect = (lang) => {
        setSelectedLang(lang);
    };

    const handleContinue = () => {
        setIsClosing(true);
        // Wait for exit animation to complete before actually updating context and hiding
        setTimeout(() => {
            setLanguage(selectedLang);
            setIsVisible(false);
        }, 300); // 300ms matches the duration of the closing animation
    };

    return (
        <div className={`fixed inset-0 z-10000 flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'opacity-0 bg-transparent backdrop-blur-none' : 'opacity-100 bg-black/40 backdrop-blur-sm'}`}>
            <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all duration-300 ${isClosing ? 'scale-95 translate-y-4 opacity-0' : 'scale-100 translate-y-0 opacity-100'}`}>
                {/* Header Pattern / Decoration */}
                <div className="relative h-24 bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 mask-[linear-gradient(to_bottom,white,transparent)]" />
                    <div className="absolute -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <Globe className="text-white w-10 h-10 relative z-10" strokeWidth={1.5} />
                </div>

                <div className="px-6 pt-4 pb-8 text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Choose Language
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Select your preferred language. You can change this later in settings.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* English Option */}
                        <button
                            onClick={() => handleLanguageSelect('en')}
                            className={`w-full group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selectedLang === 'en'
                                ? 'border-indigo-500 bg-indigo-50/50 shadow-sm shadow-indigo-100'
                                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-xl font-medium transition-transform duration-200 ${selectedLang === 'en' ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    🇺🇸
                                </span>
                                <div className="text-left">
                                    <span className={`block font-semibold ${selectedLang === 'en' ? 'text-indigo-900' : 'text-gray-700'}`}>
                                        English
                                    </span>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${selectedLang === 'en'
                                ? 'bg-indigo-500 text-white scale-100'
                                : 'bg-gray-100 text-transparent scale-90'
                                }`}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                        </button>

                        {/* Hindi Option */}
                        <button
                            onClick={() => handleLanguageSelect('hi')}
                            className={`w-full group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selectedLang === 'hi'
                                ? 'border-indigo-500 bg-indigo-50/50 shadow-sm shadow-indigo-100'
                                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-xl font-medium transition-transform duration-200 ${selectedLang === 'hi' ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    🇮🇳
                                </span>
                                <div className="text-left">
                                    <span className={`block font-semibold ${selectedLang === 'hi' ? 'text-indigo-900' : 'text-gray-700'}`}>
                                        हिंदी
                                    </span>
                                    <span className="block text-xs text-gray-400 font-medium">Hindi</span>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${selectedLang === 'hi'
                                ? 'bg-indigo-500 text-white scale-100'
                                : 'bg-gray-100 text-transparent scale-90'
                                }`}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={handleContinue}
                        className="w-full relative overflow-hidden group bg-gray-900 hover:bg-black text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md shadow-gray-200 active:scale-[0.98] cursor-pointer"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {selectedLang === 'en' ? 'Continue' : 'आगे बढ़ें'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LanguagePopup;
