import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import {
    Menu, CheckCircle, Edit2, ShieldCheck, Settings, Upload, Trash2, ChevronRight, Mic, Camera, Calendar, Clock, ArrowRight, ArrowLeft,
    Zap, Droplet, Paintbrush, Hammer, Car, Shirt, ChefHat, House,
    Search, MapPin, Map as MapIcon, Star, Filter, User, MessageSquare, LogOut, Briefcase, RefreshCw, X, History, Mail, Phone, ThumbsUp, HelpCircle, Send
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const SERVICE_ICONS = {
    electrician: Zap,
    plumber: Droplet,
    painter: Paintbrush,
    carpenter: Hammer,
    driver: Car,
    tailor: Shirt,
    cook: ChefHat,
    maid: House
};

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { tab } = useParams();
    const activeTab = tab || 'dashboard';
    const { t, language } = useLanguage();
    const { success, error, info } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [showFilter, setShowFilter] = useState(false);

    // Filter State
    const [minPrice, setMinPrice] = useState('');
    const [maxDistance, setMaxDistance] = useState('');

    // Service Flow State
    const [currentStep, setCurrentStep] = useState(1);
    const [requestData, setRequestData] = useState({
        service: '',
        problem: '',
        description: '',
        location: '',
        urgency: '',
        selectedWorker: null,
        jobId: null
    });

    // Verification state
    const [selectedDoc, setSelectedDoc] = useState('aadhar');
    const [isUploading, setIsUploading] = useState(false);

    // Track which worker button is loading during booking
    const [bookingWorkerId, setBookingWorkerId] = useState(null);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);

    const [isListening, setIsListening] = useState(false);

    const handleVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            error(language === 'hi' ? "आपका ब्राउज़र वॉयस सर्च सपोर्ट नहीं करता।" : "Speech recognition is not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            success(language === 'hi' ? "सुन रहा हूँ... अपनी जरूरत बताएं।" : "Listening... Tell me what you need.");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            
            const lowerTrans = transcript.toLowerCase();
            const matchedCategory = categories.find(c => lowerTrans.includes(c.name.toLowerCase()));
            
            if (matchedCategory) {
                // If we found a category (like "Plumber"), we set the filter to that category
                // and clear the search term so we don't try to strictly match the whole sentence.
                setFilter(matchedCategory.name);
                setSearchTerm(''); 
                success(language === 'hi' ? `${matchedCategory.name} खोज रहे हैं...` : `Searching for ${matchedCategory.name}...`);
            } else {
                // If it's just random words or a specific name, set it as the search term
                setFilter('All');
                setSearchTerm(transcript);
                success(language === 'hi' ? `खोज रहे हैं: ${transcript}` : `Searching for: ${transcript}`);
            }
            
            navigate('/customer/find-workers');
        };

        recognition.onerror = (e) => {
            setIsListening(false);
            if (e.error !== 'no-speech') {
                error("Speech error: " + e.error);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const { user, logout } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkerProfile, setSelectedWorkerProfile] = useState(null);
    const [workerFeedbacks, setWorkerFeedbacks] = useState([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });

    // Context user state for profile
    const [userProfile, setUserProfile] = useState({
        name: user?.name || "Customer",
        phone: user?.phone || "",
        address: user?.address || "Location not set",
        email: user?.email || ""
    });

    const [supportData, setSupportData] = useState({ subject: '', description: '', jobId: '' });
    const [myComplaints, setMyComplaints] = useState([]);
    const [submittingSupport, setSubmittingSupport] = useState(false);

    const [addressDetails, setAddressDetails] = useState({
        house: '',
        apartment: '',
        landmark: ''
    });

    const [addressVoiceField, setAddressVoiceField] = useState(null);

    const handleAddressVoiceInput = (field) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            error(language === 'hi' ? "आपका ब्राउज़र वॉयस सपोर्ट नहीं करता।" : "Speech recognition is not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setAddressVoiceField(field);
            success(language === 'hi' ? "सुन रहा हूँ... बोलिए।" : "Listening... Please speak.");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setAddressDetails(prev => ({ ...prev, [field]: transcript }));
        };

        recognition.onerror = (e) => {
            setAddressVoiceField(null);
            if (e.error !== 'no-speech') {
                error("Speech error: " + e.error);
            }
        };

        recognition.onend = () => {
            setAddressVoiceField(null);
        };

        recognition.start();
    };

    const fetchDashboardData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            
            // Run independent fetches concurrently for much faster load times
            const [workersRes, catRes, jobsRes, profileRes, feedbackRes] = await Promise.allSettled([
                api.get('/workers'),
                api.get('/categories'),
                api.get('/jobs'),
                api.get('/users/profile'),
                api.get('/feedbacks/my')
            ]);

            if (workersRes.status === 'fulfilled' && workersRes.value.data.workers) {
                setWorkers(workersRes.value.data.workers || []);
            }
            if (catRes.status === 'fulfilled' && catRes.value.data.success) {
                setCategories(catRes.value.data.categories || []);
            }
            if (jobsRes.status === 'fulfilled' && jobsRes.value.data.success) {
                setJobs(jobsRes.value.data.jobs || []);
            }
            if (profileRes.status === 'fulfilled' && profileRes.value.data.success && profileRes.value.data.user) {
                const u = profileRes.value.data.user;
                setUserProfile(prev => ({
                    ...prev,
                    name: u.name || prev.name,
                    phone: u.phone || prev.phone,
                    address: u.address || prev.address,
                    email: u.email || prev.email,
                    profileImage: u.profileImage || prev.profileImage
                }));
            }
            if (feedbackRes.status === 'fulfilled' && feedbackRes.value.data.success) {
                setFeedbacks(feedbackRes.value.data.feedbacks || []);
            } else {
                setFeedbacks([]);
            }
        } catch (err) {
            console.error("Failed to fetch dash data", err);
            error("Failed to load dashboard data");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        setConfirmModal({
            isOpen: true,
            title: t.dashboard?.setting?.logoutTitle || "Logout",
            message: t.dashboard?.setting?.logoutWarning || "Are you sure you want to log out?",
            onConfirm: () => {
                logout();
                navigate('/');
            },
            isDestructive: true
        });
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePhone, setDeletePhone] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = () => {
        setDeletePhone('');
        setShowDeleteModal(true);
    };

    const confirmDeleteAccount = async () => {
        // Remove spaces and '+' from both strings if any, or just check if one ends with another
        const cleanInput = deletePhone.replace(/\D/g, '');
        const cleanProfile = userProfile.phone.replace(/\D/g, '');

        // Check if the input number matches the last 10 digits of the profile number
        if (cleanInput.length < 10 || !cleanProfile.endsWith(cleanInput.slice(-10))) {
            error("Phone number does not match. Deletion failed.");
            return;
        }

        try {
            setIsDeleting(true);
            const res = await api.delete('/users/profile', { data: { phone: deletePhone } });
            if (res.data.success) {
                success(t.dashboard.setting.accountDeleted || "Account deleted successfully.");
                logout();
                navigate('/');
            }
        } catch (err) {
            console.error("Delete account error", err);
            error(err.response?.data?.message || "Failed to delete account.");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const res = await api.put('/users/profile', {
                name: userProfile.name,
                email: userProfile.email,
                address: userProfile.address,
                skills: userProfile.skills,
                profileImage: userProfile.profileImage
            });
            if (res.data.success) {
                success(t.dashboard.profileUpdate.success || "Profile updated successfully!");
                // Ideally refresh context user here or just rely on state
            }
        } catch (err) {
            console.error("Update profile error", err);
            error("Failed to update profile.");
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 600 * 1024) {
                error(language === 'hi' ? "इमेज का साइज 600KB से कम होना चाहिए" : "Image size must be less than 600KB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserProfile({ ...userProfile, profileImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = () => {
        document.getElementById('avatarUpload').click();
    };

    const handleFileUpload = () => {
        document.getElementById('docUpload').click();
    };

    const processDocumentUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            error(language === 'hi' ? "फाइल का साइज 5MB से कम होना चाहिए" : "File size must be less than 5MB");
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const res = await api.post('/users/verify', {
                    docType: selectedDoc,
                    url: reader.result
                });
                if (res.data.success) {
                    success(language === 'hi' ? "डॉक्यूमेंट सफलतापूर्वक अपलोड हो गया" : "Document uploaded successfully. Awaiting approval.");
                }
            } catch (err) {
                console.error("Doc upload error", err);
                error(language === 'hi' ? "डॉक्यूमेंट अपलोड विफल" : "Failed to upload document.");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleBookJob = async (worker = null) => {
        try {
            setLoading(true);
            setBookingWorkerId(worker ? worker._id : 'open');
            const payload = {
                workerId: worker?._id, // null if posting openly
                serviceType: requestData.service || worker?.serviceType,
                description: `${t.serviceFlow.step2.problems[requestData.service]?.[requestData.problem] || requestData.problem}. ${requestData.description}`,
                location: { type: 'Point', coordinates: [0, 0] }, // Mock until GPS hooked up
                address: `${addressDetails.house}, ${addressDetails.apartment}${addressDetails.landmark ? `, ${addressDetails.landmark}` : ''}, ${userProfile.address}`,
                scheduledDate: requestData.urgency === 'today' ? new Date(new Date().setHours(23, 59, 59)) : new Date(),
                amount: worker ? parseInt(worker.hourlyRate || 0) : null
            };
            const response = await api.post('/jobs', payload);
            if (response.data.success) {
                setRequestData({ ...requestData, selectedWorker: worker, jobId: response.data.job?._id });
                setCurrentStep(7);
                fetchDashboardData(false); // background fetch
                success("Job request sent successfully!");
            }
        } catch (err) {
            console.error(err);
            error("Failed to post job. Please try again.");
        } finally {
            setLoading(false);
            setBookingWorkerId(null);
        }
    };

    const handleCancelJob = async () => {
        if (!requestData.jobId) {
            setCurrentStep(1);
            return;
        }

        try {
            setLoading(true);
            const res = await api.put(`/jobs/${requestData.jobId}/status`, { status: 'cancelled' });
            if (res.data.success) {
                success("Service request cancelled successfully.");
                setCurrentStep(1);
                setRequestData({ ...requestData, jobId: null });
                fetchDashboardData();
            }
        } catch (err) {
            console.error(err);
            error("Failed to cancel service. Please try from Booking History.");
            setCurrentStep(1);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = () => {
        setConfirmModal({
            isOpen: true,
            title: t.workerDashboard?.clearHistoryTitle || "Clear History",
            message: t.workerDashboard?.clearHistoryConfirm || "Are you sure you want to clear your job history?",
            onConfirm: async () => {
                success(t.workerDashboard?.historyCleared || "Cannot physically delete jobs, hidden from view.");
            },
            isDestructive: true
        });
    };

    const submitFeedback = async () => {
        try {
            setLoading(true);
            const res = await api.post('/feedbacks', {
                workerId: selectedWorkerProfile._id,
                rating: feedbackData.rating,
                comment: feedbackData.comment
            });
            if (res.data.success) {
                success(t.dashboard.feedbackSuccess || "Feedback submitted successfully!");
                setShowFeedbackForm(false);
                setFeedbackData({ rating: 5, comment: '' });
                // Refresh feedbacks
                handleViewProfile(selectedWorkerProfile);
            }
        } catch (err) {
            console.error(err);
            error(t.dashboard.feedbackError || "Failed to submit feedback.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = async (worker) => {
        setSelectedWorkerProfile(worker);
        setShowAllReviews(false);
        try {
            const res = await api.get(`/feedbacks/worker/${worker._id}`);
            if (res.data.success) {
                setWorkerFeedbacks(res.data.feedbacks || []);
            }
        } catch (err) {
            console.error("Failed to fetch worker feedbacks", err);
            setWorkerFeedbacks([]);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="animate-fade-in-up pb-24">
                        {/* Step 1: Service Selection */}
                        {currentStep === 1 && (
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900">{t.serviceFlow.step1.title}</h2>
                                    <p className="text-gray-500">{t.landing.subtitle}</p>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {categories.map(category => {
                                        const serviceName = category.name.toLowerCase();
                                        const Icon = SERVICE_ICONS[serviceName] || Briefcase;
                                        return (
                                            <Card
                                                key={category._id}
                                                className="p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all aspect-square"
                                                onClick={() => {
                                                    setRequestData({ ...requestData, service: serviceName });
                                                    setCurrentStep(2);
                                                }}
                                            >
                                                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <Icon size={32} />
                                                </div>
                                                <h3 className="font-bold text-gray-800 text-lg capitalize">{category.name}</h3>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Problem Selection */}
                        {currentStep === 2 && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <Button variant="secondary" onClick={() => setCurrentStep(1)} className="h-12 w-18 p-0 rounded-full flex items-center justify-center">
                                        <ArrowLeft size={20} />
                                    </Button>
                                    <h2 className="text-3xl font-bold text-gray-900">{t.serviceFlow.step2.title}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.keys(t.serviceFlow.step2.problems[requestData.service] || {}).map(problemKey => (
                                        <Card
                                            key={problemKey}
                                            className="p-6 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-between"
                                            onClick={() => {
                                                setRequestData({ ...requestData, problem: problemKey });
                                                setCurrentStep(3);
                                            }}
                                        >
                                            <span className="font-bold text-gray-800 text-lg">{t.serviceFlow.step2.problems[requestData.service][problemKey]}</span>
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center"></div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Details */}
                        {currentStep === 3 && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <Button variant="secondary" onClick={() => setCurrentStep(2)} className="h-12 w-18 p-0 rounded-full flex items-center justify-center">
                                        <ArrowLeft size={20} />
                                    </Button>
                                    <h2 className="text-3xl font-bold text-gray-900">{t.serviceFlow.step3.title}</h2>
                                </div>
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <textarea
                                        className="w-full h-40 p-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-0 text-lg resize-none"
                                        placeholder={t.serviceFlow.step3.placeholder}
                                        value={requestData.description}
                                        onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                                    ></textarea>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <button onClick={() => success("Voice recording initialized...")} className="flex-1 py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors cursor-pointer">
                                                <Mic size={24} /> {t.serviceFlow.step3.voice}
                                            </button>
                                            
                                            {!showPhotoOptions ? (
                                                <button onClick={() => setShowPhotoOptions(true)} className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer">
                                                    <Camera size={24} /> {t.serviceFlow.step3.photo || "Take a photo"}
                                                </button>
                                            ) : (
                                                <div className="flex-1 flex gap-2">
                                                    <button onClick={() => document.getElementById('problemCameraUpload').click()} className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-colors cursor-pointer text-sm">
                                                        <Camera size={20} /> Open Camera
                                                    </button>
                                                    <button onClick={() => document.getElementById('problemFileUpload').click()} className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-colors cursor-pointer text-sm">
                                                        <Upload size={20} /> Choose File
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <input type="file" id="problemCameraUpload" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                                            if (e.target.files[0]) success("Photo captured temporarily.");
                                        }} />
                                        <input type="file" id="problemFileUpload" accept="image/*" className="hidden" onChange={(e) => {
                                            if (e.target.files[0]) success("Photo attached temporarily.");
                                        }} />
                                    </div>

                                    <Button onClick={() => setCurrentStep(4)} variant="primary" className="w-full py-4 text-lg">
                                        Next <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                    <button onClick={() => setCurrentStep(4)} className="w-full text-center text-gray-500 font-medium hover:text-gray-700 cursor-pointer">
                                        {t.serviceFlow.step3.skip}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Location */}
                        {currentStep === 4 && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <Button variant="secondary" onClick={() => setCurrentStep(3)} className="h-12 w-18 p-0 rounded-full flex items-center justify-center">
                                        <ArrowLeft size={20} />
                                    </Button>
                                    <h2 className="text-3xl font-bold text-gray-900">{t.serviceFlow.step4.title}</h2>
                                </div>
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <div className="bg-gray-100 rounded-2xl h-64 w-full mb-2 flex items-center justify-center relative overflow-hidden blur-0 hover:opacity-90 transition-opacity cursor-pointer shadow-md" onClick={() => info("Interactive Map Dragging Component Pending Integration.")}>
                                        <iframe
                                            title="Map Preview"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(userProfile.address || 'India')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                            className="absolute inset-0 grayscale opacity-80 pointer-events-none"
                                        ></iframe>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-xl shadow-blue-500/30 animate-bounce">
                                            <MapPin size={32} />
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 font-bold text-sm text-gray-800">
                                            <MapIcon size={16} /> Select location on map
                                        </div>
                                    </div>
                                    
                                    <Card className="p-6">
                                        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                            <MapPin className="text-blue-600" size={20} /> Enter Address Details
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">House/Floor/Room Number <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input type="text" value={addressDetails.house} onChange={e => setAddressDetails({...addressDetails, house: e.target.value})} placeholder={language==='hi' ? "उदा. फ्लैट 402, चौथी मंजिल" : "e.g. Flat 402, 4th Floor"} className="w-full p-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-shadow" required/>
                                                    <button onClick={() => handleAddressVoiceInput('house')} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-colors ${addressVoiceField === 'house' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} title="Speak house number">
                                                        <Mic size={18} className={addressVoiceField === 'house' ? 'animate-bounce' : ''} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apartment/Building Name <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <input type="text" value={addressDetails.apartment} onChange={e => setAddressDetails({...addressDetails, apartment: e.target.value})} placeholder={language==='hi' ? "उदा. गोकुलधाम सोसाइटी" : "e.g. Gokuldham Society"} className="w-full p-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-shadow" required/>
                                                    <button onClick={() => handleAddressVoiceInput('apartment')} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-colors ${addressVoiceField === 'apartment' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} title="Speak apartment name">
                                                        <Mic size={18} className={addressVoiceField === 'apartment' ? 'animate-bounce' : ''} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Landmark (Optional)</label>
                                                <div className="relative">
                                                    <input type="text" value={addressDetails.landmark} onChange={e => setAddressDetails({...addressDetails, landmark: e.target.value})} placeholder={language==='hi' ? "उदा. अपोलो अस्पताल के पास" : "e.g. Near Apollo Hospital"} className="w-full p-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-shadow" />
                                                    <button onClick={() => handleAddressVoiceInput('landmark')} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-colors ${addressVoiceField === 'landmark' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} title="Speak landmark">
                                                        <Mic size={18} className={addressVoiceField === 'landmark' ? 'animate-bounce' : ''} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Auto-Located Address</label>
                                                <textarea 
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 resize-none h-20 transition-shadow" 
                                                    value={userProfile.address} 
                                                    onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </Card>

                                    <Button onClick={() => {
                                        if (!addressDetails.house.trim() || !addressDetails.apartment.trim()) {
                                            error(language === 'hi' ? 'कृपया घर का नंबर और बिल्डिंग का नाम भरें। आप माइक 🎤 से बोलकर भी भर सकते हैं।' : 'Please specify house number and apartment. You can use the mic 🎤 to speak.');
                                            return;
                                        }
                                        setCurrentStep(5);
                                    }} variant="primary" className="w-full py-4 text-lg mt-2">
                                        {t.serviceFlow.step4.useLocation} <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Urgency */}
                        {currentStep === 5 && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <Button variant="secondary" onClick={() => setCurrentStep(4)} className="h-12 w-18 p-0 rounded-full flex items-center justify-center">
                                        <ArrowLeft size={20} />
                                    </Button>
                                    <h2 className="text-3xl font-bold text-gray-900">{t.serviceFlow.step5.title}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card
                                        className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all text-center"
                                        onClick={() => {
                                            setRequestData({ ...requestData, urgency: 'immediate' });
                                            setCurrentStep(6);
                                        }}
                                    >
                                        <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                            <div className="animate-pulse"><Clock size={40} /></div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{t.serviceFlow.step5.options.immediate}</h3>
                                            <p className="text-sm text-gray-500 mt-2">Within 60 mins</p>
                                        </div>
                                    </Card>

                                    <Card
                                        className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all text-center"
                                        onClick={() => {
                                            setRequestData({ ...requestData, urgency: 'today' });
                                            setCurrentStep(6);
                                        }}
                                    >
                                        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <Calendar size={40} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{t.serviceFlow.step5.options.today}</h3>
                                            <p className="text-sm text-gray-500 mt-2">By end of day</p>
                                        </div>
                                    </Card>

                                    <Card
                                        className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                                        onClick={() => {
                                            setRequestData({ ...requestData, urgency: 'schedule' });
                                            setCurrentStep(6); // Simplified for now
                                        }}
                                    >
                                        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Calendar size={40} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{t.serviceFlow.step5.options.schedule}</h3>
                                            <p className="text-sm text-gray-500 mt-2">Choose tailored time</p>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Find Workers (Filtered) */}
                        {currentStep === 6 && (
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <Button variant="secondary" onClick={() => setCurrentStep(5)} className="h-12 w-18 p-0 rounded-full flex items-center justify-center">
                                        <ArrowLeft size={20} />
                                    </Button>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900">
                                            {requestData.selectedWorker ? "Confirm Booking" : t.serviceFlow.step6.title}
                                        </h2>
                                        <p className="text-green-600 font-medium capitalize">
                                            {requestData.selectedWorker ? `Booking ${requestData.selectedWorker.name}` : `Checking for ${requestData.service || 'workers'} in your area...`}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {(requestData.selectedWorker ? [requestData.selectedWorker] : workers
                                        .filter(w => !requestData.service || (w.serviceType && w.serviceType.toLowerCase().includes(requestData.service.toLowerCase()))))
                                        .map(worker => (
                                            <Card key={worker._id || worker.id} className="group hover:shadow-xl transition-all duration-300 border-transparent hover:border-green-100 h-full flex flex-col">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <img src={worker.profileImage || "https://placehold.co/100"} alt={worker.name} className="w-16 h-16 min-w-16 min-h-16 shrink-0 rounded-2xl object-cover bg-gray-100 border border-gray-200" />
                                                                {worker.isVerified && (
                                                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                                                        <CheckCircle size={10} className="text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-xl text-gray-800 leading-tight">{worker.name}</h3>
                                                                <p className="text-green-600 font-medium text-sm bg-green-50 inline-block px-2 py-0.5 rounded-md mt-1">{worker.serviceType}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
                                                            <Star size={14} fill="currentColor" className="text-amber-500" /> {worker.rating || "0.0"}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4 mb-4">
                                                        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {worker.address || "Area"}</span>
                                                        <span className="font-bold text-gray-900 text-lg">
                                                            ₹{worker.hourlyRate || 0}
                                                            <span className="text-xs font-normal text-gray-500 ml-0.5">/visit</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="primary"
                                                    className={`w-full mt-auto ${loading && bookingWorkerId !== worker._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => handleBookJob(worker)}
                                                    disabled={loading}
                                                >
                                                    {loading && bookingWorkerId === worker._id ? "Sending..." : (requestData.selectedWorker ? "Confirm & Request" : t.serviceFlow.step6.request)}
                                                </Button>
                                            </Card>
                                        ))}

                                    {/* Fallback & Post Job Option */}
                                    {!requestData.selectedWorker && (
                                        <Card
                                            className="p-6 flex flex-col items-center justify-center text-center border-dashed border-2 border-green-300 bg-green-50/50 hover:bg-green-50 transition-all cursor-pointer min-h-[300px]"
                                            onClick={() => handleBookJob(null)}
                                        >
                                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                                                <Briefcase size={32} />
                                            </div>
                                            <h3 className="font-bold text-xl text-gray-900 mb-2">{t.serviceFlow.step6.noWorkerTitle || "Can't find the right worker?"}</h3>
                                            <p className="text-gray-500 mb-6">{t.serviceFlow.step6.noWorkerDesc || "Post a public job request and let workers contact you."}</p>
                                            <Button disabled={loading} variant="primary" className={`w-full mt-auto bg-green-600 hover:bg-green-700 ${loading && bookingWorkerId !== 'open' ? 'opacity-50' : ''}`}>
                                                {loading && bookingWorkerId === 'open' ? "Posting..." : (t.serviceFlow.step6.postJob || "Post Job Request")}
                                            </Button>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 7: Confirmation */}
                        {currentStep === 7 && (
                            <div className="max-w-2xl mx-auto py-8">
                                <Card className="p-12 flex flex-col items-center gap-6 text-center shadow-lg border-green-100">
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                                        <CheckCircle size={48} />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                                            {requestData.selectedWorker ? t.serviceFlow.step7.title : (t.serviceFlow.step7.titlePost || "Job Posted Successfully!")}
                                        </h2>
                                        <p className="text-gray-500 text-lg">
                                            {requestData.selectedWorker
                                                ? `We have sent your request to ${requestData.selectedWorker?.name}.`
                                                : (t.serviceFlow.step7.subtitlePost || "Workers near you will be notified.")}
                                        </p>
                                    </div>

                                    <div className="w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-4 text-left">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t.serviceFlow.step7.summary}</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Service</span>
                                                <span className="font-bold text-gray-900 capitalize">{requestData.service}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Problem</span>
                                                <span className="font-bold text-gray-900">{t.serviceFlow.step2.problems[requestData.service]?.[requestData.problem] || requestData.problem}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                                <span className="text-gray-600">Time</span>
                                                <span className="font-bold text-green-600 uppercase">{requestData.urgency}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Worker</span>
                                                <span className="font-bold text-gray-900">{requestData.selectedWorker?.name || "Open to all"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 w-full mt-4">
                                        <Button disabled={loading} variant="secondary" className="flex-1 py-4 text-gray-600 hover:text-red-500 hover:bg-red-50 hover:border-red-100" onClick={handleCancelJob}>
                                            {loading ? "Cancelling..." : t.serviceFlow.step7.cancel}
                                        </Button>
                                        <Button variant="primary" className="flex-1 py-4 shadow-lg shadow-green-200" onClick={() => navigate('/customer/booking-history')}>
                                            {t.serviceFlow.step7.track}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Voice Floating Button */}
                        <div className="fixed bottom-6 right-6 z-50">
                            <button onClick={handleVoiceSearch} title={language === 'hi' ? 'बोलकर खोजें' : 'Voice Search'} className={`w-16 h-16 rounded-full shadow-lg text-white flex items-center justify-center cursor-pointer transition-all ${isListening ? 'bg-red-500 shadow-red-300 animate-pulse scale-110' : 'bg-linear-to-r from-blue-600 to-blue-500 shadow-blue-300 animate-bounce-slow'}`}>
                                <Mic size={32} className={isListening ? 'animate-bounce' : ''} />
                            </button>
                        </div>
                    </div>
                );

            case 'find-workers':
                let filteredWorkers = workers.filter(worker =>
                    (filter === 'All' || worker.serviceType?.toLowerCase() === filter.toLowerCase() || worker.role === filter) &&
                    ((worker.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (worker.serviceType || "").toLowerCase().includes(searchTerm.toLowerCase()))
                );

                if (minPrice) {
                    filteredWorkers = filteredWorkers.filter(worker => parseInt(worker.hourlyRate || 0) >= parseInt(minPrice));
                }
                if (maxDistance) {
                    // Distance sorting logic goes here later
                }

                return (
                    <div className="animate-fade-in-up pb-20">
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">{t.dashboard.findWorkers}</h2>
                                <p className="text-gray-500">{t.landing.subtitle}</p>
                            </div>
                            <button onClick={fetchDashboardData} className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md" title="Refresh list">
                                <RefreshCw size={22} className={loading ? "animate-spin text-blue-500" : ""} />
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="relative z-20 mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Input
                                    placeholder={t.dashboard.searchPlaceholder}
                                    icon={Search}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() => setShowFilter(!showFilter)}
                                    variant="secondary"
                                    icon={Filter}
                                    className={`bg-white border text-gray-700 hover:bg-gray-50 ${showFilter ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                                >
                                    {t.dashboard.filter}
                                </Button>
                            </div>

                            {/* Filter Dropdown */}
                            {showFilter && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 z-30">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <h3 className="font-bold text-gray-900">{t.workerDashboard.filterBy}</h3>
                                            <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><Settings size={16} /></button>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t.workerDashboard.minPrice}</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setMinPrice('200')} className={`px-3 py-1 text-xs rounded-full border ${minPrice === '200' ? 'bg-green-600 text-white' : 'bg-gray-50'}`}>200+</button>
                                                <button onClick={() => setMinPrice('500')} className={`px-3 py-1 text-xs rounded-full border ${minPrice === '500' ? 'bg-green-600 text-white' : 'bg-gray-50'}`}>500+</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t.workerDashboard.maxDistance}</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setMaxDistance('1')} className={`px-3 py-1 text-xs rounded-full border ${maxDistance === '1' ? 'bg-green-600 text-white' : 'bg-gray-50'}`}>&lt; 1km</button>
                                                <button onClick={() => setMaxDistance('5')} className={`px-3 py-1 text-xs rounded-full border ${maxDistance === '5' ? 'bg-green-600 text-white' : 'bg-gray-50'}`}>&lt; 5km</button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t">
                                            <button onClick={() => { setMinPrice(''); setMaxDistance(''); setShowFilter(false) }} className="text-xs font-medium text-gray-500 hover:text-red-500">{t.workerDashboard.clear}</button>
                                            <button onClick={() => setShowFilter(false)} className="text-xs font-bold text-green-600 hover:text-green-700">{t.workerDashboard.apply}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Categories */}
                        <div className="flex gap-4 overflow-x-auto pb-4 mb-6 no-scrollbar">
                            {['All', ...categories.map(c => c.name)].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-all font-medium border
                                    ${filter.toLowerCase() === cat.toLowerCase()
                                            ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Worker List */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredWorkers.map(worker => (
                                <Card key={worker._id || worker.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-transparent hover:border-green-100 h-full flex flex-col" onClick={() => navigate(`/customer/worker/${worker._id}`)}>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img src={worker.profileImage || "https://placehold.co/100"} alt={worker.name} className="w-16 h-16 min-w-16 min-h-16 shrink-0 rounded-2xl object-cover bg-gray-100 border border-gray-200 group-hover:scale-105 transition-transform" />
                                                    {worker.isVerified && (
                                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                                            <CheckCircle size={10} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl text-gray-800 leading-tight">{worker.name}</h3>
                                                    <p className="text-green-600 font-medium text-sm bg-green-50 inline-block px-2 py-0.5 rounded-md mt-1">{worker.serviceType}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
                                                <Star size={14} fill="currentColor" className="text-amber-500" /> {worker.rating || "0.0"}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4 mb-4">
                                            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {worker.address?.split(',')[0] || "Area"}</span>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-gray-900 text-base">
                                                    ₹{worker.visitCharges || 0}<span className="text-xs font-normal text-gray-500 ml-0.5">/visit</span>
                                                </span>
                                                {worker.hourlyRate > 0 && (
                                                    <span className="text-xs text-gray-400">₹{worker.hourlyRate}/hr</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button variant="primary" className="w-full mt-auto" onClick={(e) => { e.stopPropagation(); handleViewProfile(worker); }}>
                                        {t.dashboard.viewProfile || "View Profile"}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="animate-fade-in-up max-w-2xl mx-auto">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900">{t.dashboard.profileUpdate.title}</h2>
                            <p className="text-gray-500">{t.profile.subtitle}</p>
                        </div>
                        <Card className="p-8">
                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden border-4 border-white shadow-lg">
                                        {userProfile.profileImage ? (
                                            <img src={userProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={64} />
                                        )}
                                    </div>
                                    <button onClick={handleAvatarUpload} className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                        <Edit2 size={18} />
                                    </button>
                                    <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-500 font-medium -mt-4 mb-2">
                                {language === 'hi' ? 'अधिकतम साइज: 600KB' : 'Max size: 600KB'}
                            </p>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label={t.profile.fullName}
                                        value={userProfile.name}
                                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                        icon={User}
                                    />
                                    <Input
                                        label={t.login.phoneLabel}
                                        value={userProfile.phone}
                                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                                        disabled
                                        className="bg-gray-50 cursor-not-allowed"
                                    />
                                </div>
                                <Input
                                    label="Email Address"
                                    value={userProfile.email}
                                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                                />
                                <Input
                                    label={t.profile.address}
                                    value={userProfile.address}
                                    onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                                    icon={MapPin}
                                />
                                <Button onClick={handleProfileUpdate} variant="primary" className="w-full py-4 text-lg mt-4">
                                    {t.dashboard.profileUpdate.save}
                                </Button>
                            </div>
                        </Card>
                    </div>
                );

            case 'verification':
                return (
                    <div className="animate-fade-in-up max-w-2xl mx-auto">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900">{t.dashboard.verify.title}</h2>
                            <p className="text-gray-500">{t.dashboard.verify.subtitle}</p>
                        </div>
                        <Card className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t.dashboard.verify.selectDoc}
                                    </label>
                                    <select
                                        value={selectedDoc}
                                        onChange={(e) => setSelectedDoc(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="aadhar">{t.dashboard.verify.aadhar}</option>
                                        <option value="pan">{t.dashboard.verify.pan}</option>
                                        <option value="voter">{t.dashboard.verify.voter}</option>
                                        <option value="passport">{t.dashboard.verify.passport}</option>
                                    </select>
                                </div>

                                <input type="file" id="docUpload" className="hidden" accept="image/*,application/pdf" onChange={processDocumentUpload} />
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleFileUpload}>
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <p className="text-gray-900 font-bold mb-1">{t.dashboard.verify.upload}</p>
                                    <p className="text-xs text-gray-500">JPG, PNG, PDF (Max 5MB)</p>
                                </div>

                                {isUploading && (
                                    <div className="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-xl">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-800 border-t-transparent"></div>
                                        <span className="font-medium">{t.dashboard.verify.status || "Uploading..."}</span>
                                    </div>
                                )}

                                <Button onClick={handleFileUpload} variant="primary" className="w-full" disabled={isUploading}>
                                    {isUploading ? "Processing..." : "Submit for Verification"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                );

            case 'booking-history':
                const historyJobs = jobs; // Filter based on history if desired
                return (
                    <div className="animate-fade-in-up pb-20 max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6 gap-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Booking History</h2>
                            {historyJobs.filter(job => job.status === 'completed' || job.status === 'cancelled').length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
                                >
                                    <Trash2 size={16} />
                                    Clear History
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {historyJobs.map(job => (
                                <Card key={job._id || job.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow gap-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900 capitalize mb-1">{job.serviceType}</h3>
                                        <p className="text-gray-500 font-medium">{job.workerId?.name ? `Worker: ${job.workerId.name}` : "Open Request"}</p>
                                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1"><Calendar size={14} /> {new Date(job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                                        <div className="font-bold text-gray-900 text-xl mb-1 mt-1">₹{job.amount || "TBD"}</div>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${job.status === 'completed' ? 'text-green-700 bg-green-100' : job.status === 'cancelled' ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100'}`}>
                                            {job.status === 'completed' ? <CheckCircle size={12} /> : job.status === 'cancelled' ? <X size={12} /> : <Clock size={12} />} {job.status.toUpperCase()}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                            {historyJobs.length === 0 && (
                                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                                    <History size={64} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No booking history available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'feedbacks':
                return (
                    <div className="animate-fade-in-up max-w-3xl mx-auto pb-20">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">{t.dashboard.feedbacks}</h2>
                            <p className="text-gray-500">Reviews you've submitted for workers</p>
                        </div>
                        <div className="space-y-4">
                            {feedbacks.length > 0 ? feedbacks.map(feedback => (
                                <Card key={feedback._id || feedback.id} className="p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img
                                            src={feedback.workerId?.profileImage || `https://ui-avatars.com/api/?name=${feedback.workerId?.name || 'W'}&background=eff6ff&color=2563eb`}
                                            alt={feedback.workerId?.name}
                                            className="w-12 h-12 rounded-2xl object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{feedback.workerId?.name || 'Worker'}</h3>
                                            <p className="text-sm text-green-600 font-medium capitalize">{feedback.workerId?.serviceType || ''}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < feedback.rating ? "currentColor" : "none"} className={i < feedback.rating ? "" : "text-gray-300"} />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 italic bg-gray-50 rounded-xl p-3 text-sm">"{feedback.comment}"</p>
                                </Card>
                            )) : (
                                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                                    <MessageSquare size={56} className="mx-auto mb-4 opacity-40" />
                                    <p className="font-medium">No reviews submitted yet.</p>
                                    <p className="text-sm mt-1">After a worker completes your job, you can leave a review from their profile.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'support':
                const submitSupportTicket = async () => {
                    if (!supportData.subject || !supportData.description) {
                        return error("Please fill subject and description");
                    }
                    setSubmittingSupport(true);
                    try {
                        const res = await api.post('/complaints', { ...supportData });
                        if (res.data.success) {
                            success("Support ticket created successfully");
                            setSupportData({ subject: '', description: '', jobId: '' });
                            const compRes = await api.get('/complaints/my');
                            if(compRes.data.success) setMyComplaints(compRes.data.complaints);
                        }
                    } catch (err) {
                        error(err.response?.data?.message || "Failed to submit ticket");
                    } finally {
                        setSubmittingSupport(false);
                    }
                };
                return (
                    <div className="animate-fade-in-up max-w-4xl mx-auto pb-20">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h2>
                            <p className="text-gray-500">Report issues, request help, or track your complaints.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Create Ticket Form */}
                            <Card className="p-6 h-fit bg-white">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                                    <Send size={20} className="text-blue-600" /> Create New Ticket
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Issue Type / Subject *</label>
                                        <select 
                                            value={supportData.subject}
                                            onChange={(e) => setSupportData({...supportData, subject: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select an issue</option>
                                            <option value="Report a Worker">Report a Worker</option>
                                            <option value="Payment Issue">Payment/Refund Issue</option>
                                            <option value="App Bug">App Bug / Glitch</option>
                                            <option value="Other">Other Query</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Related Booking (Optional)</label>
                                        <select 
                                            value={supportData.jobId}
                                            onChange={(e) => setSupportData({...supportData, jobId: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500"
                                        >
                                            <option value="">No specific booking</option>
                                            {jobs.filter(j => j.status !== 'pending').map(job => (
                                                <option key={job._id} value={job._id}>
                                                    {new Date(job.createdAt).toLocaleDateString()} - {job.serviceType} {(job.workerId?.name ? `(${job.workerId.name})` : '')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                                        <textarea
                                            value={supportData.description}
                                            onChange={(e) => setSupportData({...supportData, description: e.target.value})}
                                            placeholder="Please describe your issue in detail..."
                                            className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500 resize-none placeholder-gray-400"
                                        ></textarea>
                                    </div>
                                    <Button onClick={submitSupportTicket} variant="primary" className="w-full py-3.5 mt-2" disabled={submittingSupport}>
                                        {submittingSupport ? "Submitting..." : "Submit Ticket"}
                                    </Button>
                                </div>
                            </Card>

                            {/* Past Tickets List */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <History size={20} className="text-gray-400" /> Your Recent Tickets
                                </h3>
                                {myComplaints.length > 0 ? myComplaints.map(ticket => (
                                    <Card key={ticket._id} className="p-5 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 text-base">{ticket.subject}</h4>
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>
                                        
                                        {ticket.resolution && (
                                            <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 mt-2">
                                                <p className="text-[11px] font-bold text-blue-600 uppercase mb-1">Support Reply:</p>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium">{ticket.resolution}</p>
                                            </div>
                                        )}
                                        <p className="text-[11px] text-gray-400 font-medium mt-3">{new Date(ticket.createdAt).toLocaleString()}</p>
                                    </Card>
                                )) : (
                                    <div className="text-center py-12 px-4 bg-white/50 border border-dashed border-gray-200 rounded-2xl">
                                        <HelpCircle size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm font-medium text-gray-500">You haven't opened any support tickets.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="animate-fade-in-up max-w-md mx-auto">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900">{t.dashboard.setting.title}</h2>
                        </div>
                        <Card className="p-6 space-y-4">
                            <Button
                                onClick={handleLogout}
                                variant="secondary"
                                className="w-full justify-start text-gray-700 hover:bg-gray-100 py-4"
                                icon={LogOut}
                            >
                                {t.dashboard.logout}
                            </Button>

                            <hr className="border-gray-100" />

                            <div className="pt-2">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Danger Zone</h4>
                                <Button
                                    onClick={handleDeleteAccount}
                                    className="w-full justify-start bg-red-50 text-red-600 hover:bg-red-100 border-red-100 py-4"
                                    icon={Trash2}
                                >
                                    {t.dashboard.setting.deleteAccount}
                                </Button>
                            </div>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Layout>
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteAccount}
                title={t.dashboard.setting.deleteTitle || "Delete Account"}
                message={t.dashboard.setting.deleteWarning || "Warning: Type your registered Phone Number to delete this account."}
                confirmText={isDeleting ? "Deleting..." : (t.dashboard.setting.deleteConfirm || "Delete Account")}
                isDestructive={true}
            >
                <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Registered Phone Number</label>
                    <input
                        type="tel"
                        value={deletePhone}
                        onChange={(e) => setDeletePhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                </div>
            </ConfirmModal>
            <div className="flex min-h-[calc(100vh-80px)] bg-gray-50/50">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed md:sticky top-[80px] left-0 h-[calc(100vh-80px)] w-72 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-4 mb-8 p-4 bg-blue-50 rounded-2xl">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden shrink-0">
                                {userProfile.profileImage && !userProfile.profileImage.includes('placehold') ? (
                                    <img src={userProfile.profileImage} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    userProfile.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{t.dashboard.welcome}</p>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{userProfile.name}</h3>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <SidebarItem
                                icon={Briefcase}
                                label={t.workerDashboard.dashboard}
                                active={activeTab === 'dashboard'}
                                onClick={() => { navigate('/customer/dashboard'); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={Search}
                                label={t.dashboard.findWorkers}
                                active={activeTab === 'find-workers'}
                                onClick={() => { navigate('/customer/find-workers'); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={History}
                                label="Booking History"
                                active={activeTab === 'booking-history'}
                                onClick={() => { navigate('/customer/booking-history'); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={User}
                                label={t.dashboard.myProfile}
                                active={activeTab === 'profile'}
                                onClick={() => { navigate('/customer/profile'); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={ShieldCheck}
                                label={t.dashboard.verification}
                                active={activeTab === 'verification'}
                                onClick={() => { navigate('/customer/verification'); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={MessageSquare}
                                label={t.dashboard.feedbacks}
                                active={activeTab === 'feedbacks'}
                                onClick={() => { navigate('/customer/feedbacks'); setIsSidebarOpen(false); }}
                            />
                            <SidebarItem
                                icon={HelpCircle}
                                label="Help & Support"
                                active={activeTab === 'support'}
                                onClick={() => { navigate('/customer/support'); setIsSidebarOpen(false); }}
                            />
                        </nav>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-white shrink-0 mt-auto">
                        <button
                            onClick={() => { navigate('/customer/settings'); setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer
                            ${activeTab === 'settings'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-900'}`}
                        >
                            <Settings size={20} className={activeTab === 'settings' ? 'text-white' : 'text-gray-400'} />
                            {t.dashboard.settings}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-4">
                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`md:hidden w-full mb-6 bg-white p-4 rounded-xl shadow-md shadow-gray-200 border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all duration-300 ease-in-out transform ${isSidebarOpen ? '-translate-x-full opacity-0 pointer-events-none absolute' : 'translate-x-0 opacity-100 relative'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <Menu size={20} />
                            </div>
                            <span className="font-bold text-gray-700">{t.workerDashboard.openMenu || "Open Menu"}</span>
                        </div>
                        <div className="bg-gray-50 p-1.5 rounded-md text-gray-400 group-hover:bg-gray-100 transition-colors">
                            <ChevronRight size={16} />
                        </div>
                    </button>
                    {renderContent()}

                    {/* Ultra-Premium Worker Profile Modal */}
                    {selectedWorkerProfile && (
                        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm p-0 sm:p-4" onClick={() => { setSelectedWorkerProfile(null); setShowFeedbackForm(false); }}>
                            <div className="bg-white w-full sm:w-[460px] h-[95vh] sm:h-[88vh] rounded-t-[32px] sm:rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 ease-out" onClick={e => e.stopPropagation()}>
                                
                                {/* Floating Close Button */}
                                <button onClick={() => { setSelectedWorkerProfile(null); setShowFeedbackForm(false); }} className="absolute top-5 right-5 z-20 bg-gray-100/80 backdrop-blur-md hover:bg-gray-200 text-gray-600 p-2.5 rounded-full transition-all cursor-pointer">
                                    <X size={18} strokeWidth={3} />
                                </button>
                                
                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto pb-28">
                                    {/* Hero Identity */}
                                    <div className="pt-14 pb-8 px-8 flex flex-col items-center text-center relative">
                                        <div className="relative mb-5">
                                            <div className="w-32 h-32 rounded-full overflow-hidden ring-[6px] ring-gray-50 shadow-xl relative bg-white">
                                                <img src={selectedWorkerProfile.profileImage && !selectedWorkerProfile.profileImage.includes('placehold') ? selectedWorkerProfile.profileImage : `https://ui-avatars.com/api/?name=${selectedWorkerProfile.name}&background=eff6ff&color=2563eb`} alt={selectedWorkerProfile.name} className="w-full h-full object-cover" />
                                            </div>
                                            {selectedWorkerProfile.isVerified && (
                                                <div className="absolute bottom-1 right-1 bg-blue-500 p-1.5 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center" title="Verified Professional">
                                                    <CheckCircle size={14} className="text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-[28px] font-black tracking-tight text-gray-900 mb-1 leading-none">{selectedWorkerProfile.name}</h2>
                                        <p className="text-[14px] font-bold text-blue-600 tracking-widest uppercase mt-2">{selectedWorkerProfile.serviceType}</p>
                                        
                                        {/* Quick Actions */}
                                        <div className="flex gap-3 mt-7 w-full max-w-[300px]">
                                            <button className="flex-1 py-3.5 px-4 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] cursor-pointer" onClick={() => window.open(`tel:${selectedWorkerProfile.phone}`)}>
                                                <Phone size={16} strokeWidth={2.5} /> Call
                                            </button>
                                            <button className="flex-1 py-3.5 px-4 rounded-2xl bg-gray-100 hover:bg-green-50 hover:text-green-700 text-gray-700 font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer" onClick={() => {
                                                const phone = (selectedWorkerProfile.phone || '').replace(/\D/g, '');
                                                if (phone) {
                                                    window.open(`https://wa.me/91${phone.slice(-10)}?text=Hi%20${encodeURIComponent(selectedWorkerProfile.name)}%2C%20I%20found%20you%20on%20RozgaarSetu%20and%20need%20your%20${encodeURIComponent(selectedWorkerProfile.serviceType || 'service')}%20help.`);
                                                } else if (selectedWorkerProfile.email) {
                                                    window.open(`mailto:${selectedWorkerProfile.email}`);
                                                } else {
                                                    info('No contact info available for this worker.');
                                                }
                                            }}>
                                                <MessageSquare size={16} strokeWidth={2.5} /> Message
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Stats Grid */}
                                    <div className="flex justify-between items-center w-full px-8 py-6 border-y border-gray-100 bg-gray-50/50">
                                        <div className="text-center flex-1">
                                            <div className="flex items-center justify-center gap-1.5 text-gray-900 font-black text-2xl h-8">
                                                <Star className="text-amber-400" size={22} fill="currentColor" /> {selectedWorkerProfile.rating || "0.0"}
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Rating</p>
                                        </div>
                                        <div className="w-px h-10 bg-gray-200"></div>
                                        <div className="text-center flex-1">
                                            <div className="text-gray-900 font-black text-[22px] h-8 flex items-center justify-center overflow-hidden">
                                                <span className="text-gray-400 mr-0.5 text-lg font-bold">₹</span>{selectedWorkerProfile.hourlyRate > 0 ? selectedWorkerProfile.hourlyRate : 'N/A'}
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Per Hour</p>
                                        </div>
                                        <div className="w-px h-10 bg-gray-200"></div>
                                        <div className="text-center flex-1">
                                            <div className="text-gray-900 font-black text-[22px] h-8 flex items-center justify-center overflow-hidden">
                                                {selectedWorkerProfile.visitCharges > 0 ? <><span className="text-gray-400 mr-0.5 text-lg font-bold">₹</span>{selectedWorkerProfile.visitCharges}</> : 'Free'}
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Visit Fee</p>
                                        </div>
                                    </div>

                                    {/* Expertise Area */}
                                    <div className="px-8 py-8">
                                        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Expertise</h3>
                                        <div className="flex flex-wrap gap-2.5">
                                            {selectedWorkerProfile.skills?.length > 0 ? selectedWorkerProfile.skills.map((s, i) => (
                                                <span key={i} className="px-4 py-2 bg-gray-100/80 text-gray-700 font-bold text-[13px] rounded-xl">{s}</span>
                                            )) : <span className="text-gray-400 italic text-sm">No specific skills listed</span>}
                                        </div>
                                    </div>

                                    {/* Sleek Client Reviews */}
                                    <div className="px-8 pb-8">
                                        <div className="flex justify-between items-end mb-5">
                                            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Client Experience</h3>
                                            <button onClick={() => setShowFeedbackForm(!showFeedbackForm)} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                                {showFeedbackForm ? "Cancel" : "+ Add Feedback"}
                                            </button>
                                        </div>
                                        
                                        {showFeedbackForm && (
                                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex gap-1.5 mb-4">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button key={star} onClick={() => setFeedbackData({ ...feedbackData, rating: star })} className="cursor-pointer transition-transform hover:scale-110">
                                                            <Star size={26} fill={star <= feedbackData.rating ? "currentColor" : "none"} className={star <= feedbackData.rating ? "text-amber-400" : "text-gray-300"} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={feedbackData.comment}
                                                    onChange={e => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                                                    placeholder="Briefly describe your experience..."
                                                    className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-xl p-4 outline-none transition-all mb-4 text-[14px] font-medium text-gray-700 h-24 resize-none placeholder-gray-400 shadow-sm"
                                                ></textarea>
                                                <button onClick={submitFeedback} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2" disabled={loading || !feedbackData.comment.trim()}>
                                                    {loading ? <RefreshCw size={18} className="animate-spin" /> : "Post"}
                                                </button>
                                            </div>
                                        )}

                                        <div className="space-y-0">
                                            {workerFeedbacks.length > 0 ? (
                                                <>
                                                    {(showAllReviews ? workerFeedbacks : workerFeedbacks.slice(0, 2)).map((fb, idx) => (
                                                        <div key={idx} className="py-6 border-b border-gray-100 last:border-0 first:pt-0">
                                                            <div className="flex gap-3 mb-2">
                                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 mt-1">
                                                                    {fb.customerId?.profileImage && !fb.customerId.profileImage.includes('placehold') ? <img src={fb.customerId.profileImage} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400" />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className="text-[14px] font-bold text-gray-900">{fb.customerId?.name || "Client"}</h4>
                                                                        <span className="text-[11px] text-gray-400 font-bold uppercase">{new Date(fb.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                                                    </div>
                                                                    <div className="flex gap-0.5 mt-0.5 text-amber-400">
                                                                        {[1, 2, 3, 4, 5].map(star => (
                                                                            <Star key={star} size={11} fill={star <= fb.rating ? "currentColor" : "none"} className={star > fb.rating ? "text-gray-200" : ""} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p className="text-[14px] font-medium text-gray-600 leading-relaxed pl-13">"{fb.comment}"</p>
                                                        </div>
                                                    ))}
                                                    {workerFeedbacks.length > 2 && !showAllReviews && (
                                                        <button onClick={() => setShowAllReviews(true)} className="w-full py-3 text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer text-center mt-2">
                                                            Show {workerFeedbacks.length - 2} more reviews
                                                        </button>
                                                    )}
                                                    {workerFeedbacks.length > 2 && showAllReviews && (
                                                        <button onClick={() => setShowAllReviews(false)} className="w-full py-3 text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-center mt-2">
                                                            Show less
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="py-8 text-center text-gray-400">
                                                    <MessageSquare size={32} className="mx-auto text-gray-200 mb-3" />
                                                    <p className="text-[14px] font-medium">No reviews available yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Floating Anchored Bottom Action */}
                                <div className="absolute bottom-0 left-0 right-0 p-5 sm:px-8 sm:pb-8 bg-linear-to-t from-white via-white to-white/0 pt-12 pointer-events-none">
                                    <Button variant="primary" className="w-full py-[18px] text-[16px] font-black tracking-wide rounded-[20px] shadow-[0_8px_30px_-6px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 pointer-events-auto bg-blue-600 text-white border-0" onClick={() => { setRequestData({ ...requestData, service: selectedWorkerProfile.serviceType?.toLowerCase() || '', selectedWorker: selectedWorkerProfile }); setCurrentStep(2); setSelectedWorkerProfile(null); navigate('/customer/dashboard'); }}>
                                        Book Service <ArrowRight size={18} strokeWidth={3} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </Layout>
    );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-left cursor-pointer
        ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-900'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
        {label}
    </button>
);

export default CustomerDashboard;
