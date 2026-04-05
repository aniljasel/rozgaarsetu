import React from 'react';
import Layout from '../components/Layout';

const About = () => {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">About RozgaarSetu</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                        RozgaarSetu is a revolutionary platform designed to bridge the gap between skilled local workers and customers.
                        Our mission is to provide dignity, continuity of work, and fair wages to daily wagers while offering
                        customers a trusted source for their household needs.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        By leveraging simple voice-based technology and WhatsApp, we ensure that technology is an enabler, not a barrier, for our workforce.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default About;
