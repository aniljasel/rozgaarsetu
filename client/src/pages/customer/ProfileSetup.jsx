import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { User, MapPin, Sparkles, Navigation, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import useVoice from '../../hooks/useVoice';

const CustomerProfileSetup = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { success, error } = useToast();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    // Voice Hook Integration
    const { isListening, transcript, startListening, stopListening, error: voiceError } = useVoice({ lang: language === 'en' ? 'en-IN' : 'hi-IN' });

    // Clear name when a new recording starts to replace the old name
    useEffect(() => {
        if (isListening) {
            setName('');
        }
    }, [isListening]);

    // Auto-fill name when voice transcript updates
    useEffect(() => {
        if (transcript) {
            // Simple heuristic for customer name, just use the transcript directly 
            // since they are just stating their name (unlike worker where they state skills too)
            setName(transcript);
        }
    }, [transcript]);

    const handleToggleVoice = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleDetectLocation = () => {
        setDetectingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    try {
                        // Use BigDataCloud API for reliable free reverse geocoding
                        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                        const data = await res.json();
                        if (data.city || data.locality || data.principalSubdivision) {
                            const locName = [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(', ');
                            setAddress(locName || "Unknown Area");
                        } else {
                            // Fallback to coordinates only if nothing else works
                            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                        }
                    } catch (err) {
                        console.error("Reverse geocode failed", err);
                        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    } finally {
                        setDetectingLocation(false);
                        success("Location detected!");
                    }
                },
                (err) => {
                    if (err.code === 1) { // PERMISSION_DENIED
                        // Silently handle denial, user already knows they clicked deny
                    } else {
                        console.error("Location error:", err);
                    }
                    setDetectingLocation(false);
                    error("Unable to retrieve your location. Please type manually.");
                }
            );
        } else {
            setDetectingLocation(false);
            error("Geolocation is not supported by your browser");
        }
    };

    const calculateProgress = () => {
        let progress = 0;
        if (name.trim()) progress += 50;
        if (address.trim()) progress += 50;
        return progress;
    };

    const handleSubmit = async () => {
        if (name && address) {
            setSubmitting(true);
            try {
                const response = await api.put('/users/profile', {
                    name,
                    address
                });

                if (response.data.success) {
                    success("Profile updated successfully!");
                    navigate('/customer/dashboard', { replace: true });
                }
            } catch (err) {
                console.error("Failed to update profile", err);
                error(err.response?.data?.message || "Failed to save profile.");
            } finally {
                setSubmitting(false);
            }
        } else {
            error(t.profile.fillAll);
        }
    };

    return (
        <Layout>
            <div className="min-h-[85vh] flex items-center justify-center bg-linear-to-b from-blue-50/50 to-white px-4 py-12">
                <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">

                    {/* Decorative Header */}
                    <div className="h-40 bg-linear-to-r from-blue-600 to-blue-400 relative flex flex-col items-center justify-center text-center p-6">
                        <div className="absolute inset-0 bg-white/10 pattern-dots opacity-30"></div>
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30 text-white mb-2 transform translate-y-2">
                            <User size={36} />
                        </div>
                    </div>

                    <div className="px-8 pb-10 pt-12 md:px-12">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                                {t.profile.title}
                            </h2>
                            <p className="text-gray-500 font-medium">
                                {t.profile.subtitle}
                            </p>
                        </div>

                        <div className="space-y-8 animate-fade-in-up">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-400" />
                                    {t.profile.fullName}
                                </label>
                                <div className="relative group flex gap-3">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={t.profile.fullNamePlaceholder}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-lg text-gray-800 placeholder:text-gray-400 group-hover:bg-white"
                                        />
                                    </div>
                                    <button
                                        onClick={handleToggleVoice}
                                        className={`px-4 rounded-2xl transition-all shadow-sm border flex items-center justify-center ${isListening
                                            ? 'bg-green-50 text-green-600 border-green-200 animate-pulse'
                                            : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:scale-105 active:scale-95'
                                            }`}
                                        title={isListening ? "Recording..." : "Use Voice"}
                                    >
                                        <Mic size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Address Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    <Navigation size={16} className="text-green-500" />
                                    {t.profile.address}
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <MapPin size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={t.profile.addressPlaceholder}
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-lg text-gray-800 placeholder:text-gray-400 group-hover:bg-white"
                                        />
                                    </div>
                                    <button
                                        onClick={handleDetectLocation}
                                        disabled={detectingLocation}
                                        className="px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all shadow-sm border border-blue-100 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={t.profile.detectLocation}
                                    >
                                        {detectingLocation ? (
                                            <span className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></span>
                                        ) : (
                                            <Navigation size={24} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                variant="primary"
                                className="w-full py-5 text-lg shadow-blue-500/30 shadow-lg bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : t.profile.saveContinue}
                            </Button>
                        </div>
                    </div>

                    {/* Progress Bar Decoration */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-100">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${calculateProgress()}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CustomerProfileSetup;
