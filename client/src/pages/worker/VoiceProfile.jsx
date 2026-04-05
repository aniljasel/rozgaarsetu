import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ProgressBar from '../../components/ProgressBar';
import { Mic, StopCircle, Play, CheckCircle, User, Calendar, MapPin } from 'lucide-react';
import useVoice from '../../hooks/useVoice';
import { extractProfileData } from '../../utils/nlpUtils';

const VoiceProfile = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    // Voice Hook
    const { isListening, transcript, startListening, stopListening, error: voiceError, audioUrl, setTranscript } = useVoice({ lang: language === 'en' ? 'en-IN' : 'hi-IN' });

    const [hasRecorded, setHasRecorded] = useState(false);
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [extractedSkill, setExtractedSkill] = useState('');
    const [location, setLocation] = useState(null);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    // Watch transcript to auto-fill details
    useEffect(() => {
        if (transcript) {
            const extracted = extractProfileData(transcript);
            if (extracted.name && (isListening || !name)) setName(extracted.name);
            if (extracted.skill && (isListening || !extractedSkill)) setExtractedSkill(extracted.skill);
        }
    }, [transcript, isListening]);

    // Auto-stop recording after 5 seconds
    useEffect(() => {
        let timer;
        if (isListening) {
            timer = setTimeout(() => {
                if (isListening) {
                    stopListening();
                    setHasRecorded(true);
                }
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [isListening, stopListening]);

    const handleToggleRecord = () => {
        if (isListening) {
            stopListening();
            setHasRecorded(true);
        } else {
            startListening();
            setHasRecorded(false);
            // Also trigger location capture when they start interacting
            if (!location) {
                captureLocation();
            }
        }
    };

    const captureLocation = () => {
        setIsDetectingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsDetectingLocation(false);
                },
                (err) => {
                    console.error("Location error:", err);
                    setIsDetectingLocation(false);
                }
            );
        } else {
            setIsDetectingLocation(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto py-8">
                <ProgressBar currentStep={1} totalSteps={4} />

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">{t.workerProfile.audio.title}</h2>
                    <p className="text-gray-500 mt-2">{t.workerProfile.audio.subtitle}</p>
                </div>

                <Card className="px-6 py-8 flex flex-col gap-8">
                    {/* Personal Details inputs */}
                    <div className="space-y-4">
                        <Input
                            label={t.workerProfile.audio.enterName}
                            placeholder={t.workerProfile.audio.namePlaceholder}
                            icon={User}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                {t.workerProfile.audio.yourDob}
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-800"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Mic Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            {isListening && (
                                <div className="absolute inset-0 rounded-full bg-red-100 animate-ping"></div>
                            )}
                            <button
                                onClick={handleToggleRecord}
                                className={`relative z-10 p-8 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 ${isListening ? 'bg-red-500 text-white shadow-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200 shadow-green-100'
                                    }`}
                            >
                                {isListening ? <StopCircle size={48} /> : <Mic size={48} />}
                            </button>
                        </div>

                        <p className="text-green-600 font-medium text-sm bg-green-50 px-3 py-1 rounded-full text-center">
                            {t.workerProfile.audio.instruction} <br />
                            <span className="text-xs text-gray-500 font-normal">e.g. "I am Rahul, Plumber"</span>
                        </p>

                        <div className="text-center min-h-[60px] w-full px-4">
                            {voiceError && <p className="text-red-500 text-sm mb-2">{voiceError}</p>}

                            {isListening ? (
                                <div>
                                    <p className="text-red-500 font-bold animate-pulse mb-1">{t.workerProfile.audio.recording}</p>
                                </div>
                            ) : hasRecorded ? (
                                <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-green-600 font-bold flex items-center gap-2">
                                        <CheckCircle size={20} /> {t.workerProfile.audio.success}
                                    </p>

                                    {(extractedSkill || location) && (
                                        <div className="flex flex-wrap justify-center gap-2 text-xs font-medium mb-3 mt-1">
                                            {extractedSkill && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">Skill: {extractedSkill}</span>}
                                            {location && <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md flex items-center gap-1"><MapPin size={12} /> Location Captured</span>}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full justify-center">
                                        {audioUrl && (
                                            <button
                                                onClick={() => {
                                                    const audio = new Audio(audioUrl);
                                                    audio.play();
                                                }}
                                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 rounded-full font-bold hover:bg-green-200 transition-colors shadow-sm"
                                            >
                                                <Play size={16} fill="currentColor" /> {language === 'hi' ? 'अपनी आवाज़ सुनें' : 'Listen to Voice'}
                                            </button>
                                        )}
                                        <button onClick={() => { setHasRecorded(false); setTranscript(''); setName(''); setExtractedSkill(''); }} className="text-gray-500 hover:text-red-500 font-medium px-4 py-2.5 border border-gray-200 rounded-full bg-white shadow-sm hover:border-red-200 transition-colors">
                                            {t.workerProfile.audio.retake}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">{t.workerProfile.audio.tapMic}</p>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate('/worker/skill-select', {
                            state: {
                                profileData: {
                                    name,
                                    dob,
                                    extractedSkill,
                                    voiceTranscript: transcript,
                                    location
                                }
                            }
                        })}
                        variant="primary"
                        className="w-full mt-4"
                        disabled={!((name && dob) || hasRecorded)}
                    >
                        {t.workerProfile.audio.next}
                    </Button>
                </Card>
            </div>
        </Layout>
    );
};

export default VoiceProfile;
