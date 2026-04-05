import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ChevronRight, CheckCircle, Clock, Mic, Briefcase, Zap, UserCheck, Hammer, Users, ShieldCheck, HeartHandshake } from 'lucide-react';
import TaglineImage from '../assets/tagline.png';
import InstantBookingImage from '../assets/instant-booking.png';
import VoiceFirstImage from '../assets/voice-first.png';
import VerifiedWorkersImage from '../assets/verified-workers.png';
import verifiedWorkersImage1 from '../assets/verified-workers-1.png';
import { useLanguage } from '../context/LanguageContext';

const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [TaglineImage, verifiedWorkersImage1, InstantBookingImage, VoiceFirstImage, VerifiedWorkersImage];

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
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Layout>
            {/* HERO SECTION */}
            <div className="flex flex-col md:flex-row justify-between py-16 md:py-28 gap-12 relative overflow-hidden md:h-auto h-[900px]">
                {/* Left Content */}
                <div className="flex-1 space-y-8 text-center md:text-left z-10">
                    <div>
                        <h1 className="md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                            {/* <span className="text-green-600">Rozgaar</span>Setu <br /> */}
                            <span className="text-5xl md:text-6xl text-gray-900 font-bold block">
                                Rozgaar<span className="text-green-600">Setu</span>
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl font-semibold text-gray-800 mt-4 leading-relaxed">
                            {t.landing.heroSubtitle} <span className="text-green-600">{t.landing.heroHighlight}</span>
                        </p>
                        <p className="text-lg text-gray-500 mt-2 max-w-xl mx-auto md:mx-0">
                            {t.landing.heroDesc}
                        </p>
                    </div>

                    {user ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                            <Button
                                onClick={() => navigate(`/${user.role}/dashboard`)}
                                variant="primary"
                                className="text-lg px-8 py-4 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all"
                            >
                                {t.navbar.dashboard}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                            <Button
                                onClick={() => navigate('/role-select')}
                                variant="primary"
                                className="text-lg px-8 py-4 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all"
                                icon={ChevronRight}
                            >
                                {t.landing.start}
                            </Button>
                            <button
                                onClick={() => navigate('/role-select?role=worker')}
                                className="px-8 py-4 rounded-xl border-2 border-green-600 text-green-700 font-bold text-lg hover:bg-green-50 transition-colors"
                            >
                                {t.role.workerBtn}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Image */}
                <div className="flex-1 w-full max-w-2xl relative h-[350px] md:h-[500px]">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset - 0 transition - opacity duration - 1000 ease -in -out ${index === currentImageIndex ? 'opacity-100 layer-top' : 'opacity-0'} `}
                        >
                            <img
                                src={img}
                                alt={`Rozgaar Setu Feature ${index + 1} `}
                                className="w-full h-full object-contain drop-shadow-2xl rounded-2xl"
                                onError={(e) => { e.target.src = 'https://placehold.co/600x400'; }}
                            />
                        </div>
                    ))}
                    {/* Abstract Shapes/Blur for Premium Feel */}
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-green-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
                </div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <div className="py-20 border-t border-gray-300">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">
                        {t.landing.howItWorks.includes("RozgaarSetu") ? (
                            <>
                                {t.landing.howItWorks.split("RozgaarSetu")[0]}
                                <span className="text-green-600">Rozgaar</span>Setu
                                {t.landing.howItWorks.split("RozgaarSetu")[1]}
                            </>
                        ) : t.landing.howItWorks}
                    </h2>
                    <p className="text-xl text-gray-500 mt-4">{t.landing.howItWorksSub}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {[
                        { icon: Briefcase, title: t.landing.step1Title, desc: t.landing.step1Desc },
                        { icon: Zap, title: t.landing.step2Title, desc: t.landing.step2Desc },
                        { icon: CheckCircle, title: t.landing.step3Title, desc: t.landing.step3Desc }
                    ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-600">
                                <step.icon size={40} strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* KEY FEATURES SECTION */}
            <div className="py-20 bg-gray-50/50 rounded-[3rem] my-10 px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">
                        {t.landing.whyTitle.includes("RozgaarSetu") ? (
                            <>
                                {t.landing.whyTitle.split("RozgaarSetu")[0]}
                                <span className="text-green-600">Rozgaar</span>Setu
                                {t.landing.whyTitle.split("RozgaarSetu")[1]}
                            </>
                        ) : t.landing.whyTitle}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { title: t.landing.feature1Title, desc: t.landing.feature1Desc, img: VerifiedWorkersImage },
                        { title: t.landing.feature2Title, desc: t.landing.feature2Desc, img: InstantBookingImage },
                        { title: t.landing.feature3Title, desc: t.landing.feature3Desc, img: VoiceFirstImage }
                    ].map((item, idx) => (
                        <div key={idx} className="group relative flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                            <div className="w-full h-52 mb-6 overflow-hidden rounded-2xl relative">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">{item.title}</h3>
                            <p className="text-gray-600 relative z-10 font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* WHO IS IT FOR SECTION */}
            <div className="py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">
                        {t.landing.whoIsItFor.includes("RozgaarSetu") ? (
                            <>
                                {t.landing.whoIsItFor.split("RozgaarSetu")[0]}
                                <span className="text-green-600">Rozgaar</span>Setu
                                {t.landing.whoIsItFor.split("RozgaarSetu")[1]}
                            </>
                        ) : t.landing.whoIsItFor}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    {/* For Workers */}
                    <div className="bg-linear-to-br from-orange-50 to-white p-10 rounded-3xl border border-orange-100 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Hammer size={120} className="text-orange-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="bg-orange-100 p-3 rounded-xl text-orange-600"><UserCheck size={32} /></span>
                            {t.landing.forWorkers}
                        </h3>
                        <ul className="space-y-4 text-lg text-gray-700 font-medium">
                            <li className="flex items-center gap-3"><CheckCircle className="text-orange-500" size={20} /> {t.landing.workerPoint1}</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-orange-500" size={20} /> {t.landing.workerPoint2}</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-orange-500" size={20} /> {t.landing.workerPoint3}</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-orange-500" size={20} /> {t.landing.workerPoint4}</li>
                        </ul>
                    </div>

                    {/* For Customers */}
                    <div className="bg-linear-to-br from-blue-50 to-white p-10 rounded-3xl border border-blue-100 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={120} className="text-blue-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="bg-blue-100 p-3 rounded-xl text-blue-600"><HeartHandshake size={32} /></span>
                            {t.landing.forCustomers}
                        </h3>
                        <ul className="space-y-4 text-lg text-gray-700 font-medium">
                            <li className="flex items-center gap-3"><CheckCircle className="text-blue-500" size={20} /> {t.landing.customerPoint1}</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-blue-500" size={20} /> {t.landing.customerPoint2}</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-blue-500" size={20} /> {t.landing.customerPoint3}</li>
                            <li className="flex items-center gap-3"><CheckCircle className="text-blue-500" size={20} /> {t.landing.customerPoint4}</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* IMPACT SECTION */}
            <div className="py-20 bg-green-900 text-white rounded-[3rem] px-8 md:px-16 relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
                        {t.landing.impactTitle}
                    </h2>
                    <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed mb-8">
                        {t.landing.impactDesc}
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <span className="bg-white/10 px-6 py-2 rounded-full text-white font-medium border border-white/20">Digital India</span>
                        <span className="bg-white/10 px-6 py-2 rounded-full text-white font-medium border border-white/20">Skill India</span>
                        <span className="bg-white/10 px-6 py-2 rounded-full text-white font-medium border border-white/20">Vocal for Local</span>
                    </div>
                </div>
            </div>

            <div className="py-24 text-center">
                <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
                    {t.landing.finalCtaTitle.includes("RozgaarSetu") ? (
                        <>
                            {t.landing.finalCtaTitle.split("RozgaarSetu")[0]}
                            <span className="text-green-600">Rozgaar</span>Setu
                            {t.landing.finalCtaTitle.split("RozgaarSetu")[1]}
                        </>
                    ) : t.landing.finalCtaTitle}
                </h2>
                <p className="text-2xl text-gray-600 mb-10 font-medium">
                    {t.landing.finalCtaSub}
                </p>
                {user ? (
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button
                            onClick={() => navigate(`/${user.role}/dashboard`)}
                            variant="primary"
                            className="text-xl px-12 py-5 shadow-xl shadow-green-500/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            {t.navbar.dashboard}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button
                            onClick={() => navigate('/role-select')}
                            variant="primary"
                            className="text-xl px-12 py-5 shadow-xl shadow-green-500/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            {t.landing.start}
                        </Button>
                        <button
                            onClick={() => navigate('/role-select?role=worker')}
                            className="px-12 py-5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-xl hover:border-green-600 hover:text-green-600 hover:bg-green-50 transition-all"
                        >
                            {t.role.workerBtn}
                        </button>
                    </div>
                )}
            </div>

        </Layout>
    );
};

export default Landing;
