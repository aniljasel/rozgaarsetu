import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, HeartHandshake, TrendingUp, Sparkles, Target, Zap } from 'lucide-react';

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const About = () => {
    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
                <div className="max-w-7xl mx-auto">

                    {/* Hero Section */}
                    <motion.div
                        className="text-center mb-14"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeIn} className="flex justify-center mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold tracking-wide uppercase">
                                <Sparkles size={16} /> Empowering Communities
                            </span>
                        </motion.div>
                        <motion.h1
                            variants={fadeIn}
                            className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-3"
                        >
                            Transforming <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Daily Wage</span> Employment
                        </motion.h1>
                        <motion.p
                            variants={fadeIn}
                            className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto"
                        >
                            RozgaarSetu is a revolutionary platform bridging the gap between skilled local workers and customers, leveraging intuitive technology.
                        </motion.p>
                    </motion.div>

                    {/* Image & Mission Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-200px" }}
                            transition={{ duration: 0.8 }}
                            className="relative group rounded-3xl overflow-hidden"
                        >
                            <div className="absolute inset-0 transition-colors duration-500 z-10" />
                            <img
                                src="/images/rozgaar-setu-about.webp"
                                alt="RozgaarSetu Community"
                                className="w-full h-auto object-cover transform transition-transform duration-700 ease-in-out"
                            />
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="space-y-8"
                        >
                            <motion.div variants={fadeIn} className="bg-white p-8 rounded-3xl border border-gray-400 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                                {/* <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                    <Target size={24} />
                                </div> */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    To provide dignity, continuity of work, and fair wages to daily wagers while offering
                                    customers a trusted and verified source for their household and business needs.
                                </p>
                            </motion.div>

                            <motion.div variants={fadeIn} className="bg-white p-8 rounded-3xl border border-gray-400 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                                {/* <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                    <Zap size={24} />
                                </div> */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">The Innovation</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    By leveraging simple voice-based technology and WhatsApp integrations, we ensure that technology acts as an enabler, not a barrier, for our workforce.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Core Values / Features */}
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={fadeIn}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose RozgaarSetu</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Creating a transparent and reliable ecosystem for everyone.</p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                    >
                        {[
                            { icon: Users, title: 'Community First', desc: 'Building a strong network of verified local professionals.', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: ShieldCheck, title: 'Trusted Source', desc: 'Secure and reliable services for every household need.', color: 'text-green-600', bg: 'bg-green-50' },
                            { icon: TrendingUp, title: 'Fair Wages', desc: 'Ensuring transparent pricing and fair compensation.', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { icon: HeartHandshake, title: 'Dignity of Work', desc: 'Fostering respect and long-term opportunities.', color: 'text-rose-600', bg: 'bg-rose-50' },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeIn}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-400 hover:shadow-xl transition-all duration-200 text-center group cursor-pointer"
                            >
                                <div className={`w-16 h-16 mx-auto ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <feature.icon className={`${feature.color}`} size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </Layout>
    );
};

export default About;
