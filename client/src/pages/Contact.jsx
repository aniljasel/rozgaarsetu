import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Mail, Phone, MapPin, Send, MessageSquare, User, AtSign, FileText, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import Button from '../components/Button';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle form submission
        console.log('Form submitted:', formData);
        alert('Thank you for contacting us! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <Layout>
            <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Contact <span className="text-green-600">Us</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        We'd love to hear from you. Please fill out the form below or reach out to us directly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Contact Info Cards */}
                    <div className="space-y-8">
                        <div className="bg-green-50/50 p-8 rounded-3xl border border-green-300 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-green-100 rounded-2xl text-green-600 shrink-0">
                                    <Phone size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Helpline (24/7)</h3>
                                    <p className="text-gray-600 font-medium text-lg mt-1">+91 98765 43210</p>
                                    <p className="text-sm text-gray-500 mt-2">Available for all inquiries</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-300 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 shrink-0">
                                    <Mail size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Email Support</h3>
                                    <p className="text-gray-600 font-medium text-lg mt-1 break-all">support@rozgaarsetu.in</p>
                                    <p className="text-sm text-gray-500 mt-2">We reply within 24 hours</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50/50 p-8 rounded-3xl border border-orange-300 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 shrink-0">
                                    <MapPin size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Head Office</h3>
                                    <p className="text-gray-600 font-medium text-lg mt-1">Jaipur, Rajasthan, India</p>
                                    <p className="text-sm text-gray-500 mt-2">Visit us during business hours</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t text-center border-gray-100">
                            <div className="flex justify-center gap-4">
                                {[
                                    { icon: Instagram, color: "text-pink-600", bg: "bg-pink-50" },
                                    { icon: Facebook, color: "text-blue-600", bg: "bg-blue-50" },
                                    { icon: Twitter, color: "text-sky-500", bg: "bg-sky-50" },
                                    { icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50" }
                                ].map((social, idx) => (
                                    <a key={idx} href="#" className={`w-14 h-14 ${social.bg} rounded-full flex items-center justify-center ${social.color} hover:scale-110 transition-transform shadow-sm hover:shadow-md`}>
                                        <social.icon size={28} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <MessageSquare size={150} />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                            Send us a Message
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all font-medium"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <AtSign size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all font-medium"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <FileText size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all font-medium"
                                        placeholder="How can we help?"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all font-medium resize-none"
                                    placeholder="Write your message here..."
                                ></textarea>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-4 text-lg shadow-lg shadow-green-500/30"
                                icon={Send}
                            >
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;
