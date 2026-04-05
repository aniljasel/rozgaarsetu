import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import {
    LayoutDashboard, History, User, ShieldCheck, Settings,
    LogOut, Menu, MapPin, IndianRupee, Clock, CheckCircle, XCircle, Info, Upload,
    CreditCard, Wallet, QrCode, Share2, Camera, Search, Filter, Trash2, ArrowUpRight, X,
    Phone, Map, Shield, AlertCircle, Edit2, Save, ArrowLeft, ChevronRight, HelpCircle, Send
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const INITIAL_HISTORY = [
    { id: 101, title: "Tube Light Fix", customer: "Suman Verma", price: "150", date: "Yesterday", status: "Completed" },
    { id: 102, title: "MCB Change", customer: "Vikram Rathore", price: "400", date: "24 Jan", status: "Completed" },
];

const WorkerDashboard = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { success, error, info } = useToast();
    const { user, logout } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);

    const [activeTab, setActiveTab] = useState(tab || 'dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Keep activeTab in sync with URL
    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        } else {
            setActiveTab('dashboard');
        }
    }, [tab]);

    const handleTabClick = (newTab) => {
        navigate(`/worker/${newTab}`);
        setSelectedJob(null);
        setIsSidebarOpen(false);
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    // Filter State
    const [minPrice, setMinPrice] = useState('');
    const [maxDistance, setMaxDistance] = useState('');

    // Payment State
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [paymentType, setPaymentType] = useState('upi');
    const [upiInput, setUpiInput] = useState('');
    const [bankInput, setBankInput] = useState({ accountHolder: '', accountNumber: '', ifsc: '' });
    const [savedUpiId, setSavedUpiId] = useState('');
    const [savedBankAccount, setSavedBankAccount] = useState(null);
    const [savingPayment, setSavingPayment] = useState(false);
    const [clearedPaymentIds, setClearedPaymentIds] = useState(new Set());

    // Support State
    const [supportData, setSupportData] = useState({ subject: '', description: '', jobId: '' });
    const [myComplaints, setMyComplaints] = useState([]);
    const [submittingSupport, setSubmittingSupport] = useState(false);

    // History State
    const [history, setHistory] = useState(INITIAL_HISTORY);

    // Job Detail State
    const [selectedJob, setSelectedJob] = useState(null);

    // Profile Edit State
    const [isEditingSkills, setIsEditingSkills] = useState(false);
    const [skillInput, setSkillInput] = useState("");

    // Context user state
    const [userProfile, setUserProfile] = useState({
        name: user?.name || "Worker",
        skills: user?.skills || [],
        phone: user?.phone || "",
        address: user?.address || "",
        earnings: "0",
        avatar: user?.profileImage || "https://placehold.co/100",
        hourlyRate: user?.hourlyRate || "",
        visitCharges: user?.visitCharges || ""
    });

    const [selectedDoc, setSelectedDoc] = useState('aadhar');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/workers/profile');
                if (res.data.success && res.data.worker) {
                    const workerData = res.data.worker;
                    setUserProfile({
                        name: workerData.name || "Worker",
                        skills: workerData.skills || [],
                        phone: workerData.phone || "",
                        address: workerData.address || (workerData.location?.address) || "",
                        earnings: workerData.earnings || "0",
                        avatar: workerData.profileImage || workerData.avatar || "https://placehold.co/100",
                        hourlyRate: workerData.hourlyRate || "",
                        visitCharges: workerData.visitCharges || ""
                    });
                    // Load saved payment methods
                    if (workerData.upiId) setSavedUpiId(workerData.upiId);
                    if (workerData.bankAccount) setSavedBankAccount(workerData.bankAccount);
                }
            } catch (err) {
                console.error("Fetch profile error", err);
            }
        };
        fetchProfile();
    }, []);

    React.useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get('/jobs');
                if (res.data.success) {
                    setJobs(res.data.jobs); // includes populated customerId
                }
            } catch (err) {
                console.error("Fetch jobs error", err);
            } finally {
                setLoadingJobs(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await api.get('/complaints/my');
                if (res.data.success) {
                    setMyComplaints(res.data.complaints);
                }
            } catch (err) { console.error("Fetch complaints err", err); }
        };
        fetchComplaints();
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

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        isDeleteAccount: false
    });

    const [deletePhone, setDeletePhone] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const closeConfirmModal = () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setDeletePhone('');
    };

    const handleDeleteAccount = () => {
        setDeletePhone('');
        setConfirmModal({
            isOpen: true,
            title: t.dashboard.setting.deleteTitle || "Delete Account",
            message: t.dashboard.setting.deleteWarning || "Warning: Type your registered Phone Number to delete this account.",
            isDestructive: true,
            isDeleteAccount: true,
            onConfirm: async () => {
                // To access the latest deletePhone state inside here, we can actually pass it directly,
                // but React closure might capture initial deletePhone.
                // Let's rely on an inline check if possible, or build a dedicated wrapper.
                // Instead of putting logic here, we'll handle the delete inside a dedicated function and assign it.
            }
        });

        // Fix for closure issue: update the onConfirm directly taking the current deletePhone from state is tricky.
        // It's better to create a separate confirm function like in CustomerDashboard, or just read it from a ref.
    };

    const executeDeleteAccount = async () => {
        const cleanInput = deletePhone.replace(/\D/g, '');
        const cleanProfile = userProfile.phone.replace(/\D/g, '');

        if (cleanInput.length < 10 || !cleanProfile.endsWith(cleanInput.slice(-10))) {
            error("Phone number does not match. Deletion failed.");
            return;
        }

        try {
            setIsDeleting(true);
            const res = await api.delete('/workers/profile', { data: { phone: deletePhone } });
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
            closeConfirmModal();
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const res = await api.put('/workers/profile', {
                name: userProfile.name,
                skills: userProfile.skills,
                address: userProfile.address,
                profileImage: userProfile.avatar,
                hourlyRate: userProfile.hourlyRate ? parseInt(userProfile.hourlyRate) : undefined,
                visitCharges: userProfile.visitCharges ? parseInt(userProfile.visitCharges) : undefined
            });
            if (res.data.success) {
                success(t.dashboard.profileUpdate.success || "Profile updated successfully!");
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
                setUserProfile({ ...userProfile, avatar: reader.result });
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
                const res = await api.post('/workers/verify', {
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

    const handleClearHistory = () => {
        setConfirmModal({
            isOpen: true,
            title: t.workerDashboard.clearHistoryTitle || "Clear History",
            message: t.workerDashboard.clearHistoryConfirm,
            onConfirm: () => {
                setHistory([]);
                success(t.workerDashboard.historyCleared);
            },
            isDestructive: true
        });
    };

    const handleSharePayment = (method) => {
        info(`${t.workerDashboard.paymentShared} (${method.value})`);
    };

    const startEditingSkills = () => {
        setSkillInput(userProfile.skills.join(", "));
        setIsEditingSkills(true);
    };

    const saveSkills = () => {
        const newSkills = skillInput.split(",").map(s => s.trim()).filter(Boolean);
        setUserProfile({ ...userProfile, skills: newSkills });
        setIsEditingSkills(false);
    };

    const openMap = (coords) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${coords}`, '_blank');
    };

    const callCustomer = (phone) => {
        if (phone) window.open(`tel:${phone}`);
        else error("Phone number unavailable");
    };

    const updateJobStatus = async (jobId, status) => {
        try {
            const res = await api.put(`/jobs/${jobId}/status`, { status });
            if (res.data.success) {
                setJobs(jobs.map(j => j._id === jobId ? { ...j, status: res.data.job.status } : j));
                success(`Job updated to ${status}`);
                if (selectedJob && selectedJob._id === jobId) {
                    setSelectedJob({ ...selectedJob, status: res.data.job.status });
                    if (status !== 'accepted' && status !== 'in-progress') setSelectedJob(null);
                }
            }
        } catch (err) {
            error("Failed to update job status");
        }
    };

    const renderJobDetails = () => {
        if (!selectedJob) return null;
        return (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300 pb-20">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="secondary" onClick={() => setSelectedJob(null)} className="h-10 w-18 p-0 flex items-center justify-center rounded-full bg-white border border-gray-200">
                        <ArrowLeft className="text-gray-700 " size={20} />
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">{t.workerDashboard.jobDetails}</h2>
                </div>

                <div className="space-y-6">
                    {/* Customer Card */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{t.workerDashboard.customerDetails}</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <img src={selectedJob.customerId?.profileImage || "https://placehold.co/100"} alt={selectedJob.customerId?.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                            <div>
                                <h4 className="text-xl font-bold text-gray-900">{selectedJob.customerId?.name || "Customer"}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    {selectedJob.isVerified ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                            <Shield size={12} fill="currentColor" /> {t.workerDashboard.customerVerified}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                                            <AlertCircle size={12} /> {t.workerDashboard.customerUnverified}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={() => callCustomer(selectedJob.customerId?.phone)} variant="secondary" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100" icon={Phone}>
                                {t.workerDashboard.callCustomer}
                            </Button>
                            <Button onClick={() => openMap(selectedJob.location?.coordinates?.join(',') || '')} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" icon={Map}>
                                {t.workerDashboard.openMap}
                            </Button>
                        </div>
                    </Card>

                    {/* Job Info */}
                    <Card className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedJob.serviceType} / {selectedJob.status}</h3>
                                <p className="text-gray-500 text-sm flex items-center gap-2">
                                    <MapPin size={16} /> {selectedJob.address || "Location pending"}
                                </p>
                            </div>
                            <span className="text-2xl font-bold text-green-600 bg-green-50 px-3 py-1 rounded-xl">₹{selectedJob.amount || "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">
                            <Clock size={16} />
                            <span>{new Date(selectedJob.scheduledDate || selectedJob.createdAt).toLocaleString()}</span>
                            <span className="mx-2">•</span>
                            <span>{selectedJob.description}</span>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:border-0 md:bg-transparent md:p-0 flex flex-col gap-2">
                        {selectedJob.status === 'pending' && (
                            <Button onClick={() => updateJobStatus(selectedJob._id, 'accepted')} variant="primary" className="w-full py-4 text-lg shadow-xl shadow-green-200">
                                {t.workerDashboard.confirmAccept || "Accept"}
                            </Button>
                        )}
                        {(selectedJob.status === 'accepted' || selectedJob.status === 'in-progress') && (
                            <Button onClick={() => updateJobStatus(selectedJob._id, 'completed')} variant="primary" className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700">
                                Mark as Completed
                            </Button>
                        )}
                        {['pending', 'accepted'].includes(selectedJob.status) && (
                            <Button onClick={() => updateJobStatus(selectedJob._id, 'cancelled')} variant="secondary" className="w-full py-4 text-lg text-red-600 bg-red-50 hover:bg-red-100 border-none">
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (selectedJob) return renderJobDetails();

        switch (activeTab) {
            case 'dashboard':
                const allCompletedJobs = jobs.filter(job => job.status === 'completed');
                const realTotalEarnings = allCompletedJobs.reduce((sum, j) => sum + (j.amount || 0), 0);

                let activeJobs = jobs.filter(job => ['pending', 'accepted', 'in-progress'].includes(job.status));
                let filteredJobs = activeJobs;
                
                if (searchTerm) {
                    filteredJobs = activeJobs.filter(job =>
                        (job.serviceType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (job.customerId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (job.address || "").toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }

                if (minPrice) {
                    filteredJobs = filteredJobs.filter(job => (job.amount || 0) >= parseInt(minPrice));
                }
                if (maxDistance) {
                    // Only filter if job has valid distance data
                    filteredJobs = filteredJobs.filter(job => {
                        if (!job.distance) return true; // No distance data: show the job
                        const d = parseFloat((job.distance || '').toString().split(' ')[0]);
                        return isNaN(d) || d <= parseFloat(maxDistance);
                    });
                }

                return (
                    <div className="animate-fade-in-up space-y-6 pb-20">
                        {/* Header Banner */}
                        <div className="bg-green-600 rounded-2xl p-6 md:p-10 text-white shadow-lg shadow-green-200 relative overflow-hidden shrink-0">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-bold mb-2">{t.workerDashboard.namaste} {userProfile.name}</h1>
                                    <div className="flex items-center gap-2 text-green-100 font-medium">
                                        <Info size={16} />
                                        <span>{(userProfile.skills && userProfile.skills.length > 0) ? userProfile.skills.join(", ") : userProfile.skills} • 4.8 ★</span>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 min-w-[140px]">
                                    <p className="text-green-100 text-sm mb-1">{t.workerDashboard.totalEarnings}</p>
                                    <h2 className="text-3xl font-bold">₹{realTotalEarnings.toLocaleString()}</h2>
                                    <p className="text-green-200 text-xs mt-1">{allCompletedJobs.length} completed</p>
                                </div>
                            </div>
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Search & Filter */}
                        <div className="relative z-20">
                            <div className="flex gap-4">
                                <Input
                                    placeholder={t.workerDashboard.searchJobs}
                                    icon={Search}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-white"
                                />
                                <Button
                                    onClick={() => setShowFilter(!showFilter)}
                                    variant="secondary"
                                    icon={Filter}
                                    className={`bg-white border text-gray-700 ${showFilter ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                                >
                                    {t.workerDashboard.filter}
                                </Button>
                            </div>

                            {/* Filter Dropdown */}
                            {showFilter && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 z-30">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900">{t.workerDashboard.filterBy}</h3>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">{t.workerDashboard.minPrice}</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setMinPrice('200')} className={`px-3 py-1 text-xs rounded-full border ${minPrice === '200' ? 'bg-green-600 text-white' : 'bg-gray-50'}`}>200+</button>
                                                <button onClick={() => setMinPrice('500')} className={`px-3 py-1 text-xs rounded-full border ${minPrice === '500' ? 'bg-green-600 text-white' : 'bg-gray-50'}`}>500+</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">{t.workerDashboard.maxDistance}</label>
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

                        {/* New Jobs Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{t.workerDashboard.newJobs}</h2>
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-bold">{filteredJobs.length}</span>
                            </div>

                            <div className="grid gap-4">
                                {filteredJobs.length > 0 ? filteredJobs.map(job => (
                                    <Card key={job._id || job.id} className="p-5 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-lg text-gray-900">{job.serviceType} <span className="text-sm font-normal text-gray-500">[{job.status}]</span></h3>
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <MapPin size={16} />
                                                    <span>{job.address || "Address pending"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <Clock size={16} />
                                                    <span>{new Date(job.scheduledDate || job.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
                                                {job.amount ? (
                                                    <span className="text-xl font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">₹{job.amount}</span>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">Open Rate</span>
                                                        <span className="text-xs text-gray-400">Negotiable</span>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    {job.status === 'pending' && (
                                                        <>
                                                            <Button onClick={() => updateJobStatus(job._id, 'cancelled')} variant="secondary" className="px-4 py-2 text-sm h-auto bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border-transparent">
                                                                {t.workerDashboard.reject}
                                                            </Button>
                                                            <Button onClick={() => updateJobStatus(job._id, 'accepted')} variant="primary" className="px-6 py-2 text-sm h-auto">
                                                                {t.workerDashboard.accept}
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button onClick={() => setSelectedJob(job)} variant="secondary" className="px-4 py-2 text-sm h-auto">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )) : (
                                    <p className="text-center text-gray-500 py-8">{t.workerDashboard.noJobs}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'history':
                const historyJobs = jobs.filter(job => ['completed', 'cancelled'].includes(job.status));
                return (
                    <div className="animate-fade-in-up pb-20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">{t.workerDashboard.bookingHistory}</h2>
                            {historyJobs.length > 0 && (
                                <button
                                    onClick={() => {
                                        setConfirmModal({
                                            isOpen: true,
                                            title: t.workerDashboard.clearHistoryTitle || "Clear History",
                                            message: t.workerDashboard.clearHistoryConfirm || "Are you sure you want to clear your job history?",
                                            onConfirm: async () => {
                                                success(t.workerDashboard.historyCleared || "Cannot physically delete jobs, hidden from view.");
                                            },
                                            isDestructive: true
                                        });
                                    }}
                                    className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                    {t.workerDashboard.clearHistory}
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {historyJobs.map(job => (
                                <Card key={job._id || job.id} className="p-5 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{job.serviceType}</h3>
                                        <p className="text-sm text-gray-500">{job.customerId?.name || "Customer"}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(job.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 mb-1">₹{job.amount || "TBD"}</div>
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${job.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                            {job.status === 'completed' ? <CheckCircle size={10} /> : <XCircle size={10} />} {job.status}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                            {historyJobs.length === 0 && (
                                <div className="text-center py-10 text-gray-400">
                                    <History size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No history available.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'payments':
                const completedJobs = jobs.filter(j => j.status === 'completed');
                const totalEarned = completedJobs.reduce((sum, j) => sum + (j.amount || 0), 0);

                const handleSavePayment = async () => {
                    try {
                        setSavingPayment(true);
                        const payload = {};
                        if (paymentType === 'upi') {
                            if (!upiInput.trim()) { error('Please enter your UPI ID'); return; }
                            payload.upiId = upiInput.trim();
                        } else if (paymentType === 'bank') {
                            if (!bankInput.accountHolder || !bankInput.accountNumber || !bankInput.ifsc) { error('Please fill all bank fields'); return; }
                            payload.bankAccount = bankInput;
                        }
                        const res = await api.put('/workers/profile', payload);
                        if (res.data.success) {
                            if (paymentType === 'upi') setSavedUpiId(upiInput.trim());
                            if (paymentType === 'bank') setSavedBankAccount({ ...bankInput });
                            setShowAddPayment(false);
                            setUpiInput('');
                            setBankInput({ accountHolder: '', accountNumber: '', ifsc: '' });
                            success('Payment method saved!');
                        }
                    } catch (err) {
                        error('Failed to save payment method.');
                    } finally {
                        setSavingPayment(false);
                    }
                };

                return (
                    <div className="animate-fade-in-up space-y-8 pb-20">
                        {/* Earnings Summary */}
                        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                            <p className="text-sm font-medium opacity-80 mb-1">Total Earnings</p>
                            <p className="text-4xl font-black">₹{totalEarned.toLocaleString()}</p>
                            <p className="text-sm opacity-70 mt-1">{completedJobs.length} job{completedJobs.length !== 1 ? 's' : ''} completed</p>
                        </div>

                        {/* Methods */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{t.workerDashboard.paymentMethods}</h2>
                                <Button onClick={() => setShowAddPayment(!showAddPayment)} variant="secondary" className="text-sm h-auto py-2">
                                    {showAddPayment ? <X size={16} /> : '+ ' + t.workerDashboard.addMethod}
                                </Button>
                            </div>

                            {/* Add Payment Form */}
                            {showAddPayment && (
                                <Card className="p-6 mb-4 bg-blue-50 border-blue-100 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">{t.workerDashboard.selectMethod}</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setPaymentType('upi')} className={`flex-1 py-3 rounded-xl border font-medium transition-all cursor-pointer text-sm ${paymentType === 'upi' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>UPI</button>
                                                <button onClick={() => setPaymentType('bank')} className={`flex-1 py-3 rounded-xl border font-medium transition-all cursor-pointer text-sm ${paymentType === 'bank' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>Bank</button>
                                            </div>
                                        </div>

                                        {paymentType === 'upi' && (
                                            <Input label="UPI ID" placeholder="e.g. 9876543210@upi" value={upiInput} onChange={e => setUpiInput(e.target.value)} />
                                        )}

                                        {paymentType === 'bank' && (
                                            <div className="space-y-3">
                                                <Input label="Account Holder Name" placeholder="As per bank records" value={bankInput.accountHolder} onChange={e => setBankInput({ ...bankInput, accountHolder: e.target.value })} />
                                                <Input label="Account Number" placeholder="Enter account number" value={bankInput.accountNumber} onChange={e => setBankInput({ ...bankInput, accountNumber: e.target.value })} />
                                                <Input label="IFSC Code" placeholder="e.g. SBIN0001234" value={bankInput.ifsc} onChange={e => setBankInput({ ...bankInput, ifsc: e.target.value })} />
                                            </div>
                                        )}

                                        <Button className="w-full" variant="primary" onClick={handleSavePayment} disabled={savingPayment}>
                                            {savingPayment ? 'Saving...' : t.workerDashboard.savePayment}
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            {/* Saved Methods */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {savedUpiId && (
                                    <Card className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600"><Wallet size={20} /></div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm uppercase">UPI</p>
                                                <p className="text-xs text-gray-500">{savedUpiId}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { navigator.clipboard.writeText(savedUpiId); success('UPI ID copied!'); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors cursor-pointer" title="Copy">
                                            <Share2 size={18} />
                                        </button>
                                    </Card>
                                )}
                                {savedBankAccount?.accountNumber && (
                                    <Card className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><CreditCard size={20} /></div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{savedBankAccount.accountHolder || 'Bank Account'}</p>
                                                <p className="text-xs text-gray-500">****{savedBankAccount.accountNumber?.slice(-4)} • {savedBankAccount.ifsc}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { navigator.clipboard.writeText(`${savedBankAccount.accountHolder}\n${savedBankAccount.accountNumber}\n${savedBankAccount.ifsc}`); success('Bank details copied!'); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors cursor-pointer" title="Copy">
                                            <Share2 size={18} />
                                        </button>
                                    </Card>
                                )}
                                {!savedUpiId && !savedBankAccount?.accountNumber && (
                                    <div className="col-span-2 text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <Wallet size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm font-medium">No payment methods saved yet.</p>
                                        <p className="text-xs mt-1">Add UPI or Bank to receive payments.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment History from real jobs */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{t.workerDashboard.paymentHistory}</h2>
                                {completedJobs.filter(j => !clearedPaymentIds.has(j._id)).length > 0 && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Clear all payment history from view? (Data stays in database)')) {
                                                setClearedPaymentIds(new Set(completedJobs.map(j => j._id)));
                                            }
                                        }}
                                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={14} /> Clear History
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {completedJobs.filter(j => !clearedPaymentIds.has(j._id)).length > 0 ? completedJobs.filter(j => !clearedPaymentIds.has(j._id)).map(job => (
                                    <Card key={job._id} className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 text-green-600 p-2 rounded-full"><ArrowUpRight size={16} /></div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 capitalize">{job.serviceType}</p>
                                                <p className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-green-600">
                                            {job.amount ? `+₹${job.amount}` : <span className="text-gray-400 text-xs">No amount</span>}
                                        </span>
                                    </Card>
                                )) : (
                                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                                        <p className="text-sm">No completed jobs yet.</p>
                                        <p className="text-xs mt-1">Earnings will appear here after completing jobs.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );


            case 'profile':
                return (
                    <div className="animate-fade-in-up max-w-2xl mx-auto pb-20">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900">{t.dashboard.profileUpdate.title}</h2>
                        </div>
                        <Card className="p-8 space-y-6">
                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={handleAvatarUpload}>
                                    {userProfile.avatar ? (
                                        <img src={userProfile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 border-4 border-white shadow-lg">
                                            <User size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-green-500 p-1.5 rounded-full border-2 border-white text-white">
                                        <User size={12} />
                                    </div>
                                    <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-500 font-medium -mt-4 mb-2">
                                {language === 'hi' ? 'अधिकतम साइज: 600KB' : 'Max size: 600KB'}
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label={t.profile.fullName} value={userProfile.name} onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} icon={User} />
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.workerDashboard.skills}</label>
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl flex items-center min-h-[50px] relative">
                                        {isEditingSkills ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                className="w-full bg-transparent p-3 outline-none text-gray-700 font-medium"
                                                onBlur={saveSkills}
                                            />
                                        ) : (
                                            <div className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap px-4 py-3 w-full">
                                                {userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills.map((skill, i) => (
                                                    <span key={i} className="inline-block bg-white px-2 py-0.5 rounded border mr-2 text-sm shadow-sm">{skill}</span>
                                                )) : <span className="text-gray-400">No skills added</span>}
                                            </div>
                                        )}
                                        <button
                                            onClick={isEditingSkills ? saveSkills : startEditingSkills}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer"
                                        >
                                            {isEditingSkills ? <Save size={16} className="text-green-600" /> : <Edit2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Input label={t.login.phoneLabel} value={userProfile.phone} disabled className="bg-gray-50 cursor-not-allowed" />
                            <Input label={t.profile.address} value={userProfile.address} onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })} icon={MapPin} />

                            {/* Pricing Card */}
                            <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-green-500 text-white p-1.5 rounded-lg">
                                        <IndianRupee size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Pricing Settings</h3>
                                        <p className="text-xs text-gray-500">Customers will see these charges before booking</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Hourly Rate (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="e.g. 500"
                                                value={userProfile.hourlyRate}
                                                onChange={(e) => setUserProfile({ ...userProfile, hourlyRate: e.target.value })}
                                                className="w-full pl-7 pr-3 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-shadow font-medium"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Per hour charge</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Visit Charges (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="e.g. 200"
                                                value={userProfile.visitCharges}
                                                onChange={(e) => setUserProfile({ ...userProfile, visitCharges: e.target.value })}
                                                className="w-full pl-7 pr-3 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition-shadow font-medium"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">One-time visit fee</p>
                                    </div>
                                </div>
                                {(userProfile.hourlyRate || userProfile.visitCharges) && (
                                    <div className="mt-3 p-3 bg-white/70 rounded-xl border border-green-100 text-sm text-gray-600">
                                        <span className="font-bold text-gray-800">Preview: </span>
                                        {userProfile.hourlyRate && <span>₹{userProfile.hourlyRate}/hr</span>}
                                        {userProfile.hourlyRate && userProfile.visitCharges && <span> + </span>}
                                        {userProfile.visitCharges && <span>₹{userProfile.visitCharges} visit charge</span>}
                                    </div>
                                )}
                            </div>

                            <Button variant="primary" className="w-full mt-4" onClick={handleProfileUpdate}>
                                {t.dashboard.profileUpdate.save}
                            </Button>
                        </Card>
                    </div>
                );

            case 'verification':
                return (
                    <div className="animate-fade-in-up max-w-2xl mx-auto pb-20">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900">{t.dashboard.verify.title}</h2>
                            <p className="text-gray-500">{t.dashboard.verify.subtitle}</p>
                        </div>
                        <Card className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t.dashboard.verify.selectDoc}</label>
                                    <select
                                        value={selectedDoc}
                                        onChange={(e) => setSelectedDoc(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="aadhar">{t.dashboard.verify.aadhar}</option>
                                        <option value="pan">{t.dashboard.verify.pan}</option>
                                        <option value="voter">{t.dashboard.verify.voter}</option>
                                    </select>
                                </div>

                                <input type="file" id="docUpload" className="hidden" accept="image/*,application/pdf" onChange={processDocumentUpload} />
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleFileUpload}>
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <p className="text-gray-900 font-bold mb-1">{t.dashboard.verify.upload}</p>
                                    <p className="text-xs text-gray-500">Max 5MB</p>
                                </div>

                                {isUploading && (
                                    <div className="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-xl">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-800 border-t-transparent"></div>
                                        <span className="font-medium">Uploading...</span>
                                    </div>
                                )}

                                <Button variant="primary" className="w-full" onClick={handleFileUpload} disabled={isUploading}>
                                    {isUploading ? "Processing..." : "Submit"}
                                </Button>
                            </div>
                        </Card>
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
                                    <Send size={20} className="text-green-600" /> Create New Ticket
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Issue Type / Subject *</label>
                                        <select 
                                            value={supportData.subject}
                                            onChange={(e) => setSupportData({...supportData, subject: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-green-500"
                                        >
                                            <option value="">Select an issue</option>
                                            <option value="Report Customer">Report a Customer</option>
                                            <option value="Payment Issue">Payment/Earning Issue</option>
                                            <option value="App Bug">App Bug / Glitch</option>
                                            <option value="Other">Other Query</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Related Job (Optional)</label>
                                        <select 
                                            value={supportData.jobId}
                                            onChange={(e) => setSupportData({...supportData, jobId: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-green-500"
                                        >
                                            <option value="">No specific job</option>
                                            {jobs.length > 0 && jobs.map(job => (
                                                <option key={job._id} value={job._id}>
                                                    {new Date(job.createdAt).toLocaleDateString()} - {job.serviceType} {(job.customerId?.name ? `(${job.customerId.name})` : '')}
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
                                            className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-green-500 resize-none placeholder-gray-400"
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
                                    <Card key={ticket._id} className="p-5 border-l-4 border-green-500 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 text-base">{ticket.subject}</h4>
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>
                                        
                                        {ticket.resolution && (
                                            <div className="bg-green-50/50 rounded-lg p-3 border border-green-100 mt-2">
                                                <p className="text-[11px] font-bold text-green-600 uppercase mb-1">Support Reply:</p>
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
                    <div className="animate-fade-in-up max-w-md mx-auto pb-20">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.dashboard.setting.title}</h2>
                        <Card className="p-6 space-y-4">
                            <Button onClick={handleLogout} variant="secondary" className="w-full justify-start py-4" icon={LogOut}>
                                {t.dashboard.logout}
                            </Button>

                            <hr className="border-gray-100" />

                            <Button
                                onClick={handleDeleteAccount}
                                className="w-full justify-start bg-red-50 text-red-600 hover:bg-red-100 border-red-100 py-4"
                                icon={Trash2}
                            >
                                {t.dashboard.setting.deleteAccount}
                            </Button>
                        </Card>
                    </div>
                );

            default: return null;
        }
    }

    return (
        <Layout>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.isDeleteAccount ? executeDeleteAccount : confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={isDeleting ? "Processing..." : "Confirm"}
                isDestructive={confirmModal.isDestructive}
            >
                {confirmModal.isDeleteAccount && (
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
                )}
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
                        <div className="flex items-center gap-4 mb-8 p-4 bg-green-50 rounded-2xl">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl overflow-hidden shadow-sm shrink-0">
                                {userProfile.avatar && !userProfile.avatar.includes('placehold') ? (
                                    <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    userProfile.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{userProfile.name}</h3>
                                <p className="text-xs text-green-600 font-medium line-clamp-1">{userProfile.skills.join(", ")}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <SidebarItem icon={LayoutDashboard} label={t.workerDashboard.dashboard} active={activeTab === 'dashboard' && !selectedJob} onClick={() => handleTabClick('dashboard')} />
                            <SidebarItem icon={History} label={t.workerDashboard.bookingHistory} active={activeTab === 'history'} onClick={() => handleTabClick('history')} />
                            <SidebarItem icon={Wallet} label={t.workerDashboard.payments} active={activeTab === 'payments'} onClick={() => handleTabClick('payments')} />
                            <SidebarItem icon={User} label={t.workerDashboard.myProfile} active={activeTab === 'profile'} onClick={() => handleTabClick('profile')} />
                            <SidebarItem icon={ShieldCheck} label={t.dashboard.verification} active={activeTab === 'verification'} onClick={() => handleTabClick('verification')} />
                            <SidebarItem icon={HelpCircle} label="Help & Support" active={activeTab === 'support'} onClick={() => handleTabClick('support')} />
                        </nav>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-white shrink-0 mt-auto">
                        <button
                            onClick={() => handleTabClick('settings')}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors font-medium cursor-pointer
                            ${activeTab === 'settings'
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                                    : 'text-gray-600 hover:bg-green-50 hover:text-green-900'}`}
                        >
                            <Settings size={20} className={activeTab === 'settings' ? 'text-white' : 'text-gray-400'} />
                            {t.dashboard.settings}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto mt-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`md:hidden w-full mb-6 bg-white p-4 rounded-xl shadow-md shadow-gray-200 border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all duration-300 ease-in-out transform ${isSidebarOpen ? '-translate-x-full opacity-0 pointer-events-none absolute' : 'translate-x-0 opacity-100 relative'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 p-2 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                                <Menu size={20} />
                            </div>
                            <span className="font-bold text-gray-700">{t.workerDashboard.openMenu || "Open Menu"}</span>
                        </div>
                        <div className="bg-gray-50 p-1.5 rounded-md text-gray-400 group-hover:bg-gray-100 transition-colors">
                            <ChevronRight size={16} />
                        </div>
                    </button>
                    {renderContent()}
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
                ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                : 'text-gray-600 hover:bg-green-50 hover:text-green-900'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
        {label}
    </button>
);

export default WorkerDashboard;
