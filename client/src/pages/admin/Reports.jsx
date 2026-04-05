import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { AlertTriangle, User, Shield, CheckCircle, Clock, X } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const ReportsPage = () => {
    const { success, error } = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedReport, setSelectedReport] = useState(null);
    const [resolutionText, setResolutionText] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('/complaints');
            if (res.data.success) {
                setReports(res.data.complaints);
            }
        } catch (err) {
            error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!resolutionText.trim()) return error("Please enter resolution details");
        setUpdating(true);
        try {
            const res = await api.put(`/complaints/${selectedReport._id}`, { 
                status: 'resolved', 
                resolution: resolutionText 
            });
            if (res.data.success) {
                success("Complaint resolved successfully");
                setReports(reports.map(r => r._id === selectedReport._id ? { ...r, status: 'resolved', resolution: resolutionText } : r));
                setSelectedReport(null);
                setResolutionText('');
            }
        } catch (err) {
            error("Failed to resolve complaint");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-20">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Complaints & Reports</h2>
                    <p className="text-sm text-gray-500">Handle user issues and platform safety</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {reports.filter(r => r.status !== 'resolved').length} Active
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 opacity-50">Loading reports...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reports.length > 0 ? reports.map(report => (
                        <Card key={report._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-none shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="flex gap-4 w-full sm:w-auto">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {report.status === 'resolved' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${report.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : report.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {report.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200">
                                            {report.userModel} Ref
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium">• {new Date(report.createdAt).toLocaleString()}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg">{report.subject}</h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">"{report.description}"</p>
                                    <p className="text-xs font-medium text-gray-500 mt-2">
                                        Reported by: <span className="font-bold text-gray-700">{report.userId?.name || 'Unknown User'}</span>
                                        {report.jobId && <span className="ml-2 text-indigo-600">| Associated Job ID: {report.jobId._id}</span>}
                                    </p>
                                    {report.resolution && (
                                        <div className="mt-3 bg-green-50/50 border border-green-100 p-2.5 rounded-lg">
                                            <p className="text-[10px] font-bold text-green-700 uppercase mb-0.5">Resolution:</p>
                                            <p className="text-sm text-gray-700">{report.resolution}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                {report.status !== 'resolved' ? (
                                    <Button onClick={() => setSelectedReport(report)} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 px-6">Take Action</Button>
                                ) : (
                                    <span className="px-3 py-1 bg-green-50 border border-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                        <CheckCircle size={14} /> Resolved
                                    </span>
                                )}
                            </div>
                        </Card>
                    )) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                            <Shield size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium text-gray-600 mb-1">No reports found</p>
                            <p className="text-sm">Your platform is running smoothly.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Action/Resolution Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg bg-white p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Resolve Complaint</h3>
                                <p className="text-sm text-gray-500 mt-1">Provide a resolution message for the user.</p>
                            </div>
                            <button onClick={() => { setSelectedReport(null); setResolutionText(''); }} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{selectedReport.subject}</h4>
                            <p className="text-sm text-gray-600">"{selectedReport.description}"</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Resolution Message *</label>
                                <textarea
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    placeholder="Explain how this issue was resolved..."
                                    className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 resize-none"
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">This message will be visible to the user who reported the issue.</p>
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => { setSelectedReport(null); setResolutionText(''); }} variant="secondary" className="flex-1 bg-gray-100 hover:bg-gray-200 border-none text-gray-700">Cancel</Button>
                                <Button onClick={handleResolve} variant="primary" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={updating}>
                                    {updating ? "Saving..." : "Mark as Resolved"}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
