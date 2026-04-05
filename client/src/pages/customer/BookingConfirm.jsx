import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { CheckCircle } from 'lucide-react';

const BookingConfirm = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[85vh] text-center pt-16 pb-10">
                <Card className="p-12 flex flex-col items-center gap-4 max-w-md">
                    <div className="bg-green-100 p-6 mt-6 rounded-full text-green-600 animate-bounce">
                        <CheckCircle size={60} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h2>
                    <p className="text-gray-500">
                        Your request has been sent to <strong>Ramesh Kumar</strong>.
                        You will receive a confirmation call shortly.
                    </p>
                    <div className="w-full bg-gray-50 p-4 border border-gray-200 rounded-lg flex justify-between text-sm mt-4">
                        <span className="text-gray-500">Booking ID</span>
                        <span className="font-mono font-bold">#RS-9821</span>
                    </div>
                    <Button onClick={() => navigate('/customer/dashboard')} variant="primary" className="w-full mt-4">
                        Back to Dashboard
                    </Button>
                </Card>
            </div>
        </Layout>
    );
};

export default BookingConfirm;
