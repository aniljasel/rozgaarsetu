import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { Phone, MessageCircle, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { login, user } = useAuth();
    const role = state?.role || 'worker'; // Default to worker if accessed directly

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

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // phone, otp
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async () => {
        if (phone.length === 10) {
            setError('');
            setLoading(true);
            try {
                // Remove +91 or any country code logic if it was there, assuming clean 10 digit
                const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

                const response = await api.post('/auth/send-otp', {
                    phone: formattedPhone,
                    role
                });

                if (response.data.success) {
                    setStep('otp');
                    // Optional: show a toast/alert that OTP was sent
                    // if (response.data._devOtp) {
                    //     console.log("DEV OTP:", response.data._devOtp);
                    // }
                }
            } catch (err) {
                console.error("Error sending OTP:", err);
                setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            setError(t.login.invalidPhone);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length === 4) {
            setError('');
            setLoading(true);
            try {
                const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
                const response = await api.post('/auth/verify-otp', {
                    phone: formattedPhone,
                    otp,
                    role
                });

                if (response.data.success) {
                    // Update Auth Context with Token and User Data
                    // The useEffect above will handle the correct redirection
                    login(response.data.token, response.data.user);
                }
            } catch (err) {
                console.error("Error verifying OTP:", err);
                setError(err.response?.data?.message || t.login.invalidOtp);
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please enter a valid 4-digit OTP.');
        }
    };

    return (
        <Layout>
            <div className="min-h-[85vh] flex items-center justify-center bg-linear-to-b from-green-50/50 to-white px-4 py-12">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">

                    {/* Decorative Header */}
                    <div className={`h-32 ${role === 'worker' ? 'bg-linear-to-r from-green-600 to-green-400' : 'bg-linear-to-r from-blue-600 to-blue-400'} relative flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-white/10 pattern-dots opacity-30"></div>
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30 text-white">
                            <Lock size={32} />
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                                {role === 'worker' ? t.login.workerTitle : t.login.customerTitle}
                            </h2>
                            <p className="text-gray-500 font-medium">
                                {step === 'phone' ? t.login.phoneStepTitle : t.login.otpStepTitle}
                            </p>
                        </div>

                        {step === 'phone' ? (
                            <div className="space-y-6 animate-fade-in">
                                {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1 block">{t.login.phoneLabel}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Phone size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="9876543210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all font-bold text-lg tracking-widest text-gray-800"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSendOtp}
                                    variant="primary"
                                    className="w-full py-4 text-lg shadow-green-500/30 shadow-lg"
                                    icon={MessageCircle}
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : t.login.getOtp}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fade-in">
                                {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}
                                <div>
                                    {/* <label className="text-sm font-bold text-slate-700 mb-4 block text-center uppercase tracking-wide">{t.login.enterOtp}</label> */}
                                    <div className="flex justify-center gap-3">
                                        {[0, 1, 2, 3].map((index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="tel"
                                                inputMode="numeric"
                                                maxLength={1}
                                                className="w-16 h-16 text-center text-3xl font-extrabold rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:scale-110 outline-none transition-all bg-gray-50 text-gray-800"
                                                value={otp[index] || ''}
                                                disabled={loading}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (/[^0-9]/.test(val)) return;
                                                    const newOtp = otp.split('');
                                                    newOtp[index] = val;
                                                    const newOtpStr = newOtp.join('');
                                                    setOtp(newOtpStr);

                                                    if (val && index < 3) {
                                                        document.getElementById(`otp-${index + 1}`).focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                        document.getElementById(`otp-${index - 1}`).focus();
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Button onClick={handleVerifyOtp} variant="primary" className="w-full py-4 text-lg shadow-green-500/30 shadow-lg" icon={ShieldCheck} disabled={loading}>
                                    {loading ? 'Verifying...' : t.login.verifyLogin}
                                </Button>

                                <button
                                    onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                                    className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
                                >
                                    <ArrowLeft size={16} /> {t.login.changePhone}
                                </button>
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-400">
                                {t.login.agreePrefix}
                                <span className="text-gray-600 font-bold cursor-pointer hover:underline">{t.login.terms}</span>
                                {t.login.and}
                                <span className="text-gray-600 font-bold cursor-pointer hover:underline">{t.login.privacy}</span>
                                {t.login.agreeSuffix}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
