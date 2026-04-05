import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Filter, BarChart2 } from 'lucide-react';
import api from '../../api/axios';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get('/admin/jobs');
                if (res.data.success) {
                    setJobs(res.data.jobs);
                }
            } catch (err) {
                console.error("Failed to fetch admin jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'in-progress': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'accepted': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'cancelled': return 'bg-slate-100 text-slate-700 border border-slate-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Job History</h2>
                    <p className="text-sm text-gray-500">Track all service requests and bookings</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="border-gray-200 text-gray-600"><Filter size={18} className="mr-2" /> Filter Status</Button>
                    <Button variant="outline" className="border-gray-200 text-gray-600"><BarChart2 size={18} className="mr-2" /> Export CSV</Button>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-sm ring-1 ring-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-5 pl-6">Job ID</th>
                                <th className="p-5">Service</th>
                                <th className="p-5">Customer</th>
                                <th className="p-5">Worker</th>
                                <th className="p-5">Amount</th>
                                <th className="p-5">Date</th>
                                <th className="p-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {jobs.map(job => (
                                <tr key={job._id || job.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="p-5 pl-6 text-sm font-mono text-gray-500 font-medium">{job._id.substring(job._id.length - 8).toUpperCase()}</td>
                                    <td className="p-5 text-sm font-semibold text-gray-900">{job.serviceType}</td>
                                    <td className="p-5 text-sm text-gray-600">{job.customerId?.name || 'Customer'}</td>
                                    <td className="p-5 text-sm text-gray-600">{job.workerId?.name || 'Unassigned'}</td>
                                    <td className="p-5 text-sm font-bold text-gray-900">₹{job.amount || 0}</td>
                                    <td className="p-5 text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">No jobs found in the system.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default JobsPage;
