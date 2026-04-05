import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { Search, Filter, MoreHorizontal, MapPin, Star, Eye, CheckCircle, Ban, Trash2, ChevronDown, Check } from 'lucide-react';

const WorkersPage = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const { success, error, info, warning } = useToast();

    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/admin/workers');
            if (res.data.success) {
                setWorkers(res.data.workers);
            }
        } catch (err) {
            console.error(err);
            error("Failed to load workers");
        } finally {
            setLoading(false);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [filters, setFilters] = useState({
        sortBy: 'date-desc',
        status: { verified: true, approved: true, pending: true, blocked: true }
    });

    const getDisplayStatus = (worker) => {
        if (worker.status === 'blocked') return 'Blocked';
        if (!worker.isApproved) return 'Pending';
        if (worker.isApproved && !worker.isVerified) return 'Approved';
        return 'Verified';
    };

    const filteredWorkers = useMemo(() => {
        let result = [...workers];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(w =>
                (w.name || '').toLowerCase().includes(query) ||
                (w.phone || '').includes(query) ||
                (w.serviceType || '').toLowerCase().includes(query)
            );
        }

        result = result.filter(w => {
            const status = getDisplayStatus(w).toLowerCase();
            if (status === 'verified' && filters.status.verified) return true;
            if (status === 'approved' && filters.status.approved) return true;
            if (status === 'pending' && filters.status.pending) return true;
            if (status === 'blocked' && filters.status.blocked) return true;
            return false;
        });

        result.sort((a, b) => {
            if (filters.sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
            if (filters.sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
            if (filters.sortBy === 'date-asc') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            if (filters.sortBy === 'date-desc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            return 0;
        });

        return result;
    }, [workers, searchQuery, filters]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'verified': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'approved': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'rejected': return 'bg-red-100 text-red-700 border border-red-200';
            case 'blocked': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    const toggleMenu = (id) => {
        if (activeMenu === id) {
            setActiveMenu(null);
        } else {
            setActiveMenu(id);
        }
    };

    const handleView = () => {
        info("Worker profile details coming soon!");
        setActiveMenu(null);
    };

    const handleVerify = async (id) => {
        try {
            const res = await api.put(`/admin/workers/${id}/approve`, { isApproved: true });
            if (res.data.success) {
                setWorkers(workers.map(w => w._id === id ? { ...w, isApproved: true } : w));
                success("Worker has been approved successfully.");
            }
        } catch (err) {
            error("Failed to approve worker.");
        }
        setActiveMenu(null);
    };

    const handleBlock = (id) => {
        // Implement block API logic later if needed
        warning("Blocking capability is not fully implemented on backend yet.");
        setActiveMenu(null);
    };

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });

    const closeConfirmModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    // Helper to open modal
    const openConfirm = (title, message, onConfirm, isDestructive = false) => {
        setActiveMenu(null);
        setConfirmModal({ isOpen: true, title, message, onConfirm, isDestructive });
    };

    const handleDelete = (id) => {
        openConfirm(
            "Delete Worker",
            "Are you sure you want to delete this worker? This action cannot be undone.",
            () => {
                // Future DELETE API call
                error("Worker deleted (mock action).");
            },
            true
        );
    };

    return (
        <div className="space-y-6 animate-fade-in-up" onClick={() => setActiveMenu(null)}>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.isDestructive ? "Delete" : "Confirm"}
                isDestructive={confirmModal.isDestructive}
            />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Worker Management</h2>
                    <p className="text-sm text-gray-500">Verify and manage service providers</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto relative">
                    <div className="bg-gray-50 border ring-1 ring-gray-200 rounded-lg flex items-center px-3 focus-within:ring-2 focus-within:ring-indigo-500 w-full sm:w-64">
                        <Search className="text-gray-400 shrink-0" size={18} />
                        <input
                            type="text"
                            placeholder="Search workers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none py-2 pl-2 pr-4 outline-none w-full text-sm"
                        />
                    </div>

                    <div className="relative">
                        <Button
                            variant="outline"
                            className="border-gray-200 text-gray-600 cursor-pointer h-full"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} className="sm:mr-2" /> <span className="hidden sm:inline">Filter</span>
                        </Button>

                        {showFilters && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 animate-fade-in-up origin-top-right">
                                <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-50 pb-2">Filter & Sort</h3>

                                <div className="space-y-4">
                                    {/* Sort */}
                                    <div className="relative">
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Sort By</label>
                                        <div
                                            onClick={() => setShowSortMenu(!showSortMenu)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer flex justify-between items-center transition-colors"
                                        >
                                            <span className="text-gray-700 font-medium">
                                                {filters.sortBy === 'date-desc' && 'Date: Newest First'}
                                                {filters.sortBy === 'date-asc' && 'Date: Oldest First'}
                                                {filters.sortBy === 'name-asc' && 'Name: A to Z'}
                                                {filters.sortBy === 'name-desc' && 'Name: Z to A'}
                                            </span>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                                        </div>

                                        {showSortMenu && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1 animate-fade-in-up">
                                                {[
                                                    { id: 'date-desc', label: 'Date: Newest First' },
                                                    { id: 'date-asc', label: 'Date: Oldest First' },
                                                    { id: 'name-asc', label: 'Name: A to Z' },
                                                    { id: 'name-desc', label: 'Name: Z to A' }
                                                ].map(option => (
                                                    <div
                                                        key={option.id}
                                                        onClick={() => {
                                                            setFilters({ ...filters, sortBy: option.id });
                                                            setShowSortMenu(false);
                                                        }}
                                                        className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors ${filters.sortBy === option.id ? 'bg-indigo-50/50 text-indigo-700 font-medium' : 'text-gray-700'}`}
                                                    >
                                                        {option.label}
                                                        {filters.sortBy === option.id && <Check size={14} className="text-indigo-600" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Status</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.status.verified}
                                                    onChange={(e) => setFilters({
                                                        ...filters,
                                                        status: { ...filters.status, verified: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">Verified</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.status.approved}
                                                    onChange={(e) => setFilters({
                                                        ...filters,
                                                        status: { ...filters.status, approved: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">Approved</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.status.pending}
                                                    onChange={(e) => setFilters({
                                                        ...filters,
                                                        status: { ...filters.status, pending: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">Pending</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.status.blocked}
                                                    onChange={(e) => setFilters({
                                                        ...filters,
                                                        status: { ...filters.status, blocked: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">Blocked</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-sm ring-1 ring-gray-100 min-h-[400px]">
                <div className="overflow-x-auto pb-24">
                    <table className="w-full min-w-[800px] text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-5 pl-6">Worker</th>
                                <th className="p-5">Phone</th>
                                <th className="p-5">Service</th>
                                <th className="p-5">Rating</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredWorkers.map(worker => {
                                const statusLabel = getDisplayStatus(worker);
                                return (
                                    <tr key={worker._id || worker.id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="p-5 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 shrink-0 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-sm ring-2 ring-white shadow-sm">
                                                    {worker.name ? String(worker.name).charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{worker.name || 'Unnamed Worker'}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {worker.address || "Location pending"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm text-gray-600 font-medium">{worker.phone}</td>
                                        <td className="p-5 text-sm text-gray-600">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{worker.serviceType || 'Not specified'}</span>
                                        </td>
                                        <td className="p-5 text-sm text-gray-600">
                                            <div className="flex items-center gap-1 font-medium">
                                                <Star size={14} className="fill-amber-400 text-amber-400" /> {worker.rating || 0}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(statusLabel)}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right pr-6 relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(worker._id);
                                                }}
                                                className={`p-2 rounded-full transition-colors cursor-pointer ${activeMenu === worker._id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                                                    }`}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenu === worker._id && (
                                                <div className="absolute right-8 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up origin-top-right">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleView()}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Eye size={16} className="text-blue-500" /> View Profile
                                                        </button>
                                                        {worker.status !== 'Verified' && (
                                                            <button
                                                                onClick={() => handleVerify(worker._id)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <CheckCircle size={16} className="text-emerald-500" /> Verify Worker
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleBlock(worker._id)}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Ban size={16} className="text-amber-500" /> Block Worker
                                                        </button>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                        <button
                                                            onClick={() => handleDelete(worker._id)}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default WorkersPage;
