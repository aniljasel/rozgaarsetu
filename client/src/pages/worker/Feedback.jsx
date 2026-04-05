import React from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { Star, ThumbsUp } from 'lucide-react';

const REVIEWS = [
    { id: 1, customer: "Amit Sharma", rating: 5, comment: "Excellent work, very professional.", date: "2 Days ago" },
    { id: 2, customer: "Priya Singh", rating: 4, comment: "Good job but came a bit late.", date: "1 Week ago" },
    { id: 3, customer: "Rahul Verma", rating: 5, comment: "Fixed everything quickly!", date: "2 Weeks ago" },
];

const WorkerFeedback = () => {
    return (
        <Layout>
            <div className="py-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Ratings & Feedback</h1>

                {/* Summary Card */}
                <Card className="mb-8 bg-linear-to-r from-green-50 to-blue-50 border-none">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-gray-800">4.8</h2>
                        <div className="flex justify-center text-yellow-500 my-2">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" size={24} />)}
                        </div>
                        <p className="text-gray-500">Based on 12 reviews</p>
                        <div className="mt-4 flex gap-4 justify-center">
                            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-1">
                                <ThumbsUp size={14} className="text-blue-500" /> 95% Positive
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Reviews List */}
                <div className="space-y-4">
                    {REVIEWS.map(review => (
                        <Card key={review.id} className="hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-800">{review.customer}</h3>
                                    <p className="text-xs text-gray-400">{review.date}</p>
                                </div>
                                <div className="flex text-yellow-500 text-sm">
                                    {Array(review.rating).fill(0).map((_, i) => <Star key={i} fill="currentColor" size={14} />)}
                                </div>
                            </div>
                            <p className="text-gray-600 mt-2">"{review.comment}"</p>
                        </Card>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default WorkerFeedback;
