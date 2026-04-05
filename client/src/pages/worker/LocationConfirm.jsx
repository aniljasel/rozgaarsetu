import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import ProgressBar from '../../components/ProgressBar';
import { MapPin, Check, Navigation } from 'lucide-react';

const LocationConfirm = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { t } = useLanguage();
    const { success, error } = useToast();

    // Auto-fill from voice location extraction if available
    const initialCoords = state?.profileData?.location || null;

    const [location, setLocation] = useState('');
    const [manualLocation, setManualLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [coords, setCoords] = useState(initialCoords);

    // Initial reverse geocode if coords exist from VoiceProfile
    React.useEffect(() => {
        if (coords && !location) {
            reverseGeocode(coords.lat, coords.lng);
        }
    }, [coords]);

    const reverseGeocode = async (lat, lng) => {
        setLoading(true);
        try {
            // Using a free open source geocoding API for demonstration
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const data = await res.json();
            if (data.city || data.locality || data.principalSubdivision) {
                const locName = [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(', ');
                setLocation(locName || "Unknown Area");
            } else {
                setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        } catch (err) {
            console.error("Reverse geocode failed", err);
            setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDetectLocation = () => {
        setLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCoords({ lat, lng });
                    reverseGeocode(lat, lng);
                },
                (err) => {
                    console.error("Location error:", err);
                    setLoading(false);
                    error("Unable to retrieve your location");
                }
            );
        } else {
            setLoading(false);
            error("Geolocation is not supported by your browser");
        }
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const finalLocation = location || manualLocation;
            // Get data gathered from previous steps
            const profileData = state?.profileData || {};

            const payload = {
                ...profileData,
                address: finalLocation,
            };

            // If we have distinct coordinates, send them to the backend in GeoJSON format
            if (coords) {
                payload.location = {
                    type: 'Point',
                    coordinates: [coords.lng, coords.lat] // GeoJSON is [longitude, latitude]
                };
            }

            const response = await api.put('/workers/profile', payload);

            if (response.data.success) {
                success("Profile updated successfully!");
                navigate('/worker/dashboard', { replace: true });
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            error(err.response?.data?.message || 'Failed to update profile. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <Layout>
            <div className="max-w-md mx-auto py-8 text-center">
                <ProgressBar currentStep={3} totalSteps={4} />

                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.workerProfile.location.title}</h2>
                <p className="text-gray-500 mb-8">{t.workerProfile.location.subtitle}</p>

                <Card className="py-10 px-6 flex flex-col items-center gap-6">
                    <div className="bg-blue-50 p-6 rounded-full text-blue-500 animate-pulse ring-4 ring-blue-50">
                        <MapPin size={48} />
                    </div>

                    <div className="w-full space-y-6">
                        {/* Detected Location Section */}
                        <div className="text-center">
                            {location ? (
                                <div className="bg-green-50 border border-green-100 p-4 rounded-xl animate-in fade-in zoom-in">
                                    <p className="text-green-700 text-xs font-bold uppercase tracking-wider mb-1">{t.workerProfile.location.detectedLabel}</p>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
                                        <Check size={18} className="text-green-500" />
                                        {location}
                                    </h3>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleDetectLocation}
                                    variant="secondary"
                                    className="w-full border-2 border-blue-100 text-blue-600 hover:bg-blue-50 py-4"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                                            {t.workerProfile.location.detecting}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Navigation size={18} />
                                            {t.workerProfile.location.detectBtn}
                                        </span>
                                    )}
                                </Button>
                            )}
                        </div>

                        <div className="relative flex py-2 items-center">
                            <div className="grow border-t border-gray-200"></div>
                            <span className="shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
                            <div className="grow border-t border-gray-200"></div>
                        </div>

                        {/* Manual Location Section */}
                        <div className="text-left">
                            <Input
                                label={t.workerProfile.location.manualLabel}
                                placeholder={t.workerProfile.location.manualPlaceholder}
                                icon={MapPin}
                                value={manualLocation}
                                onChange={(e) => {
                                    setManualLocation(e.target.value);
                                    if (e.target.value) setLocation(''); // Clear detected if typing manual
                                }}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleConfirm}
                        variant="primary"
                        className="w-full mt-2"
                        icon={Check}
                        disabled={submitting || (!location && !manualLocation)}
                    >
                        {submitting ? 'Saving...' : t.workerProfile.location.confirmBtn}
                    </Button>
                </Card>
            </div>
        </Layout>
    );
};

export default LocationConfirm;
