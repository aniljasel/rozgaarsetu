import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { CheckCircle, XCircle, Shield, Phone, FileText } from 'lucide-react';

const VerificationsPage = () => {
    const [pendingItems, setPendingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    useEffect(() => {
        fetchPendingVerifications();
    }, []);

    const fetchPendingVerifications = async () => {
        try {
            const [workersRes, usersRes] = await Promise.all([
                api.get('/admin/workers'),
                api.get('/admin/users')
            ]);
            let combined = [];
            if (workersRes.data.success) {
                // Keep workers that are NOT approved AND have submitted at least one document
                combined = [...combined, ...workersRes.data.workers.filter(w => !w.isApproved && w.documents && w.documents.length > 0).map(w => ({ ...w, _type: 'worker' }))];
            }
            if (usersRes.data.success) {
                // Keep users that are NOT approved AND have submitted at least one document
                // Customer documents might be named differently depending on schema, but we mapped it identical
                combined = [...combined, ...usersRes.data.users.filter(u => !u.isApproved && u.documents && u.documents.length > 0).map(u => ({ ...u, _type: 'user' }))];
            }
            setPendingItems(combined);
        } catch (err) {
            console.error("Failed to fetch pending verifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (docs) => {
        if (!docs || docs.length === 0) {
            error("No document attached");
            return;
        }
        // Open the most recent document base64 in a new window/tab
        const latestDoc = docs[docs.length - 1];
        if (latestDoc && latestDoc.url) {
            const win = window.open();
            win.document.write(`<iframe src="${latestDoc.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        } else {
            error("Invalid document format");
        }
    };

    const handleVerify = async (id, type) => {
        try {
            const endpoint = type === 'worker' ? `/admin/workers/${id}/approve` : `/admin/users/${id}/approve`;
            const res = await api.put(endpoint, { isApproved: true });
            if (res.data.success) {
                setPendingItems(pendingItems.filter(item => item._id !== id));
                success(`${type === 'worker' ? 'Worker' : 'Customer'} application approved`);
            }
        } catch (err) {
            error("Failed to approve application");
        }
    };

    const handleReject = async (id, type) => {
        try {
            error("Rejection API not finalized, hiding from UI for now.");
            setPendingItems(pendingItems.filter(item => item._id !== id));
        } catch (err) {
            error("Failed to reject");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Worker Verification</h2>
                    <p className="text-sm text-gray-500">Review and approve new worker applications</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0">
                    {pendingItems.length} Pending
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingItems.map(item => (
                    <Card key={item._id || item.id} className="p-6 relative overflow-hidden border-none shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow">
                        <div className="absolute top-4 right-4 capitalize bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">
                            {item._type}
                        </div>
                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-inner mb-4 overflow-hidden">
                                {item.profileImage ? (
                                    <img src={item.profileImage} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{item.name ? String(item.name).charAt(0).toUpperCase() : 'U'}</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{item.name || 'Unnamed'}</h3>
                            <p className="text-sm text-gray-500 font-medium">{item.serviceType || 'Customer'}</p>
                            <p className="text-xs text-gray-400 mt-1">{item.address || "Location pending"}</p>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                <span className="flex items-center text-gray-600 gap-2"><Phone size={16} /> Phone Verified</span>
                                {item.isVerified ? (
                                    <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle size={14} /> Yes</span>
                                ) : (
                                    <span className="text-amber-600 font-bold flex items-center gap-1"><XCircle size={14} /> No</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                <span className="flex items-center text-gray-600 gap-2">
                                    <FileText size={16} /> {item.documents && item.documents.length > 0 ? item.documents[item.documents.length - 1].docType || 'Document' : 'Document'}
                                </span>
                                <button onClick={() => handleViewDocument(item.documents)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded cursor-pointer">
                                    View
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Button onClick={() => handleReject(item._id, item._type)} variant="outline" className="flex-1 text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200">
                                Reject
                            </Button>
                            <Button onClick={() => handleVerify(item._id, item._type)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200">
                                Approve
                            </Button>
                        </div>
                    </Card>
                ))}
                {pendingItems.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No pending verifications
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationsPage;
