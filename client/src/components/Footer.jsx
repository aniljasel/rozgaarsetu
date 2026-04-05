import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ChevronRight, Linkedin } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-linear-to-br from-gray-900 to-gray-800 text-white mt-auto pt-10 pb-10 rounded-t-4xl">
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">

                    {/* Column 1: Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="inline-block group">
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="Logo" className="h-12 w-12 rounded-xl group-hover:opacity-100 transition-opacity" />
                                <span className="text-3xl font-extrabold tracking-tight">
                                    Rozgaar<span className="text-green-400">Setu</span>
                                </span>
                            </div>
                        </Link>
                        <p className="text-gray-400 text-lg leading-relaxed font-medium">
                            स्थानीय कामगारों और ग्राहकों को जोड़ने वाला भारत का सबसे भरोसेमंद मंच। लोकल जॉब्स, अब आपके हाथ में।
                        </p>
                        <div className="flex gap-4 pt-2">
                            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-8 text-green-400">Quick Links</h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Home", path: "/" },
                                { name: "About Us", path: "/about" },
                                { name: "Contact Support", path: "/contact" },
                                { name: "Privacy Policy", path: "/privacy" }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link to={link.path} className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2 text-lg">
                                        <ChevronRight size={16} className="text-green-500" /> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Services */}
                    <div>
                        <h3 className="text-xl font-bold mb-8 text-green-400">Our Services</h3>
                        <ul className="space-y-4">
                            {[
                                { name: "Find Workers", path: "/workers" },
                                { name: "Post a Job", path: "/jobs" },
                                { name: "Worker Registration", path: "/role-select?role=worker" },
                                { name: "Verified Skills", path: "/about" }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link to={link.path} className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2 text-lg">
                                        <ChevronRight size={16} className="text-green-500" /> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h3 className="text-xl font-bold mb-8 text-green-400">Contact Us</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 text-gray-400 group">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-green-500/20 transition-colors">
                                    <MapPin className="text-green-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">Head Office</p>
                                    <p className="mt-1">Jaipur, Rajasthan, India</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 text-gray-400 group">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-green-500/20 transition-colors">
                                    <Mail className="text-green-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">Email Us</p>
                                    <a href="mailto:support@rozgaarsetu.in" className="mt-1 hover:text-green-400 transition-colors">support@rozgaarsetu.in</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 text-gray-400 group">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-green-500/20 transition-colors">
                                    <Phone className="text-green-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">Call Support</p>
                                    <p className="mt-1">+91 98765 43210</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-700/50 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
                    <p>&copy; {new Date().getFullYear()} RozgaarSetu. Made for Bharat 🇮🇳</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
