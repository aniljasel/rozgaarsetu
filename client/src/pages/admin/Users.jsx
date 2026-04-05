import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import { Search, Filter, MoreHorizontal, Eye, Ban, Trash2, CheckCircle, ChevronDown, Check, MapPin } from 'lucide-react';

const UsersPage = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const { success, error, info } = useToast();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [filters, setFilters] = useState({
        sortBy: 'date-desc',
        status: { active: true, unactive: true, blocked: true }
    });

    const getUserStatus = (user) => {
        if (user.status) return user.status;
        return 'Active';
    };

    const filteredUsers = useMemo(() => {
        let result = [...users];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.name || '').toLowerCase().includes(query) ||
                (u.phone || '').includes(query)
            );
        }

        result = result.filter(u => {
            const status = getUserStatus(u).toLowerCase();
            if (status === 'active' && filters.status.active) return true;
            if (status === 'unactive' && filters.status.unactive) return true;
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
    }, [users, searchQuery, filters]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (err) {
            console.error(err);
            error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'blocked': return 'bg-red-100 text-red-700 border border-red-200';
            case 'unactive': return 'bg-amber-100 text-amber-700 border border-amber-200';
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
        info("User details feature coming soon!");
        setActiveMenu(null);
    };

    const handleBlockToggle = (id, currentStatus) => {
        // Implement block API later
        info("Blocking capability is not fully implemented on backend yet.");
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
            "Delete User Account",
            "Are you sure you want to permanently delete this user? This action cannot be undone.",
            () => {
                // Future API Call 
                info("User account deleted permanently (mock).");
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
                    <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500">Manage customer accounts and viewing rights</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto relative">
                    <div className="bg-gray-50 border ring-1 ring-gray-200 rounded-lg flex items-center px-3 focus-within:ring-2 focus-within:ring-indigo-500 w-full sm:w-64">
                        <Search className="text-gray-400 shrink-0" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
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
                                                    checked={filters.status.active}
                                                    onChange={(e) => setFilters({
                                                        ...filters,
                                                        status: { ...filters.status, active: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">Active</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.status.unactive}
                                                    onChange={(e) => setFilters({
                                                        ...filters,
                                                        status: { ...filters.status, unactive: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">Unactive</span>
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
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-5 pl-6">Name</th>
                                <th className="p-5">Phone</th>
                                <th className="p-5">Location</th>
                                <th className="p-5 text-center">Total Requests</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map(user => (
                                <tr key={user._id || user.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="p-5 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm ring-2 ring-white shadow-sm shrink-0">
                                                {user.name ? String(user.name).charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.name || 'Unnamed'}</p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} /> {user.address || "Location pending"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm text-gray-600 font-medium">{user.phone}</td>
                                    <td className="p-5 text-sm text-gray-600">{user.address || "Location pending"}</td>
                                    <td className="p-5 text-sm text-gray-900 font-bold text-center">0</td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(getUserStatus(user))}`}>
                                            {getUserStatus(user)}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right pr-6 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMenu(user._id || user.id);
                                            }}
                                            className={`p-2 rounded-full transition-colors cursor-pointer ${activeMenu === (user._id || user.id) ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                                                }`}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenu === (user._id || user.id) && (
                                            <div className="absolute right-8 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up origin-top-right">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleView()}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Eye size={16} className="text-blue-500" /> View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlockToggle(user._id || user.id, 'Active')}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Ban size={16} className="text-amber-500" /> Block User
                                                    </button>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                    <button
                                                        onClick={() => handleDelete(user._id || user.id)}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Trash2 size={16} /> Delete Account
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default UsersPage;
