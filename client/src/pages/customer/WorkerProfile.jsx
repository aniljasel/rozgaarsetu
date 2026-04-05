import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Phone, MessageCircle, MapPin, Star, ShieldCheck, Calendar, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

const WorkerProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State for storing the fetched worker
    const [worker, setWorker] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchWorker = async () => {
            try {
                const res = await api.get(`/workers/${id}`);
                setWorker(res.data.worker);
            } catch (error) {
                console.error("Failed to fetch worker", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorker();
    }, [id]);

    const handleBook = () => {
        navigate('/customer/booking-confirm', { state: { workerId: worker?._id } });
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                </div>
            </Layout>
        );
    }

    if (!worker) {
        return (
            <Layout>
                <div className="text-center py-20 text-gray-500">Worker not found</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="secondary" onClick={() => navigate(-1)} className="h-10 w-18 p-0 flex items-center justify-center rounded-full bg-white border border-gray-200">
                        <ArrowLeft className="text-gray-700" size={20} />
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">Worker Details</h2>
                </div>
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <img src={worker.image} alt={worker.name} className="w-24 h-24 rounded-full object-cover bg-gray-200" />
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                                {worker.name}
                                {worker.verified && <ShieldCheck size={20} className="text-blue-500" />}
                            </h1>
                            <p className="text-lg text-green-600 font-medium">{worker.role}</p>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-current" /> {worker.rating} ({worker.reviews} reviews)</span>
                                <span className="flex items-center gap-1"><MapPin size={16} /> {worker.distance}</span>
                                <span>Exp: {worker.experience}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <Button variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-none" icon={MessageCircle}>WhatsApp</Button>
                        <Button variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none" icon={Phone}>Call Now</Button>
                        <Button onClick={handleBook} variant="primary" className="col-span-2 py-4 text-lg bg-orange-500 hover:bg-orange-600 shadow-orange-200">Book Now</Button>
                    </div>
                </Card>

                {/* Reviews Section Placeholder */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-gray-800">Customer {i}</span>
                                <span className="text-yellow-500 text-sm">★★★★★</span>
                            </div>
                            <p className="text-gray-600 text-sm">Great service, very polite and on time.</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default WorkerProfileView;
