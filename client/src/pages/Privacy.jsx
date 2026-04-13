import React from 'react';
import Layout from '../components/Layout';
import { Shield, Lock, Eye, FileText, Database, UserCheck, Mail } from 'lucide-react';

const Privacy = () => {
    return (
        <Layout>
            <div className="py-12 md:py-20 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-full mb-6">
                        <Lock size={48} className="text-green-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Privacy Policy - <span className="text-green-600">Rozgaar</span>Setu
                    </h1>
                    <p className="text-xl text-gray-500 font-medium">Last updated: 2026</p>
                    <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        RozgaarSetu respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-12">

                    {/* Information Collection */}
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                            <div className="bg-blue-50 p-3 rounded-2xl shrink-0">
                                <FileText size={32} className="text-blue-600" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                                <p className="text-gray-600 mb-4">We may collect the following details:</p>
                                <ul className="space-y-3 text-left">
                                    {['Name and mobile number', 'Location (for nearby worker matching)', 'Skills and work category (for workers)', 'Basic usage data (for improving the service)'].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-gray-700 font-medium">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 text-sm text-gray-500 italic">We do not collect unnecessary personal data.</p>
                            </div>
                        </div>
                    </div>

                    {/* How We Use Information */}
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                            <div className="bg-purple-50 p-3 rounded-2xl shrink-0">
                                <Eye size={32} className="text-purple-600" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                                <p className="text-gray-600 mb-4">Your information is used only to:</p>
                                <ul className="space-y-3 text-left">
                                    {['Connect workers with nearby customers', 'Verify worker profiles', 'Improve platform performance and user experience', 'Provide support and communication'].map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Aadhaar & Data Sharing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-400 hover:shadow-xl transition-shadow">
                            <div className="bg-orange-50 p-3 rounded-2xl w-fit mb-6">
                                <UserCheck size={32} className="text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Aadhaar & Verification</h2>
                            <ul className="space-y-3 text-gray-700 font-medium">
                                <li className="flex items-start gap-3"><span className="text-orange-500 mt-1">✓</span> Aadhaar details are used only for verification purposes</li>
                                <li className="flex items-start gap-3"><span className="text-orange-500 mt-1">✓</span> We do not store Aadhaar numbers publicly</li>
                                <li className="flex items-start gap-3"><span className="text-orange-500 mt-1">✓</span> Verification is handled securely</li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-400 hover:shadow-xl transition-shadow">
                            <div className="bg-teal-50 p-3 rounded-2xl w-fit mb-6">
                                <Database size={32} className="text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
                            <ul className="space-y-3 text-gray-700 font-medium">
                                <li className="flex items-start gap-3"><span className="text-teal-500 mt-1">✓</span> We do not sell or rent user data</li>
                                <li className="flex items-start gap-3"><span className="text-teal-500 mt-1">✓</span> Data is shared only when required for service delivery</li>
                                <li className="flex items-start gap-3"><span className="text-teal-500 mt-1">✓</span> Government integration (future) will follow legal guidelines</li>
                            </ul>
                        </div>
                    </div>

                    {/* Security & Rights */}
                    <div className="bg-linear-to-br from-gray-900 to-gray-800 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <Shield size={40} className="text-green-400" />
                                <h2 className="text-3xl font-bold">Data Security & User Rights</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-200 mb-4 border-b border-gray-700 pb-2">Security Measures</h3>
                                    <ul className="space-y-3 text-gray-300">
                                        <li>• Secure servers and encrypted communication are used</li>
                                        <li>• Access to data is limited and protected</li>
                                        <li>• We take reasonable steps to prevent misuse</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-200 mb-4 border-b border-gray-700 pb-2">Your Rights</h3>
                                    <ul className="space-y-3 text-gray-300">
                                        <li>• Access your data</li>
                                        <li>• Update or correct your information</li>
                                        <li>• Request deletion of your account</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/* Abstract Background */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Contact & Footer Quote */}
                    <div className="text-center pt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
                        <a href="mailto:support@rozgaarsetu.in" className="inline-flex items-center gap-3 px-5 py-4 bg-white border-2 border-green-100 rounded-2xl text-xl font-bold text-gray-800 hover:border-green-600 hover:text-green-600 transition-all group">
                            <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                                <Mail size={24} className="text-green-600" />
                            </div>
                            support@rozgaarsetu.in
                        </a>

                        <div className="mt-16 py-8 border-t border-gray-200">
                            <p className="text-2xl font-serif italic text-gray-400">
                                “Your data. Your control. Your trust.”
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Privacy;
