import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ConfirmModal from '../../components/ConfirmModal';
import { Lock, Shield, Layers, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';

const SettingsPage = () => {
    const { success, error, info } = useToast();

    // Password States
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Categories States
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Platform Settings State
    const [platformSettings, setPlatformSettings] = useState({
        maintenanceMode: false,
        workerRegistration: true,
        customerRegistration: true
    });
    const [loadingSettings, setLoadingSettings] = useState(true);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false
    });

    const closeConfirmModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    const openConfirm = (title, message, onConfirm, isDestructive = false) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, isDestructive });
    };

    useEffect(() => {
        fetchCategories();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            if (res.data.success) {
                setPlatformSettings(res.data.settings);
            }
        } catch (err) {
            console.error(err);
            error("Failed to load platform settings.");
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleToggleSetting = async (settingName) => {
        const newValue = !platformSettings[settingName];
        
        // Optimistic UI update
        setPlatformSettings(prev => ({ ...prev, [settingName]: newValue }));
        
        try {
            const res = await api.put('/admin/settings', {
                [settingName]: newValue
            });
            
            if (res.data.success) {
                // success("Setting updated");
            }
        } catch (err) {
            console.error(err);
            // Revert on error
            setPlatformSettings(prev => ({ ...prev, [settingName]: !newValue }));
            error("Failed to update setting. Please try again.");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            if (res.data.success) {
                setCategories(res.data.categories);
            }
        } catch (err) {
            console.error(err);
            error("Failed to load categories.");
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            return error("Please fill in all password fields.");
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            return error("New passwords do not match.");
        }
        if (passwords.newPassword.length < 6) {
            return error("New password must be at least 6 characters long.");
        }

        setLoadingPassword(true);
        try {
            const res = await api.put('/admin/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            if (res.data.success) {
                success("Password updated successfully!");
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            console.error(err);
            error(err.response?.data?.message || "Failed to update password.");
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            return error("Please enter a category name.");
        }

        try {
            const res = await api.post('/categories', { name: newCategoryName.trim() });
            if (res.data.success) {
                setCategories([...categories, res.data.category]);
                setNewCategoryName('');
                success("Category added successfully!");
            }
        } catch (err) {
            console.error(err);
            error(err.response?.data?.message || "Failed to add category.");
        }
    };

    const handleDeleteCategory = (id, name) => {
        openConfirm(
            "Delete Category",
            `Are you sure you want to delete the "${name}" category?`,
            async () => {
                try {
                    const res = await api.delete(`/categories/${id}`);
                    if (res.data.success) {
                        setCategories(categories.filter(c => c._id !== id));
                        success("Category removed.");
                    }
                } catch (err) {
                    console.error(err);
                    error("Failed to delete category.");
                }
            },
            true
        );
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.isDestructive ? "Delete" : "Confirm"}
                isDestructive={confirmModal.isDestructive}
            />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security Settings */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                            <Lock size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Account Security</h2>
                            <p className="text-sm text-gray-500">Update your admin credentials</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        />
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                        />
                        <div className="pt-2">
                            <Button
                                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                                onClick={handleUpdatePassword}
                                disabled={loadingPassword}
                            >
                                {loadingPassword ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    {/* Platform Rules */}
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Platform Control</h2>
                                <p className="text-sm text-gray-500">Manage global platform settings</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                                    <p className="text-sm text-gray-500">Disable access for all users</p>
                                </div>
                                <div 
                                    onClick={() => handleToggleSetting('maintenanceMode')} 
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${platformSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${platformSettings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Worker Registration</h3>
                                    <p className="text-sm text-gray-500">Allow new workers to join</p>
                                </div>
                                <div 
                                    onClick={() => handleToggleSetting('workerRegistration')}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${platformSettings.workerRegistration ? 'bg-green-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${platformSettings.workerRegistration ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Customer Registration</h3>
                                    <p className="text-sm text-gray-500">Allow new customers to join</p>
                                </div>
                                <div 
                                    onClick={() => handleToggleSetting('customerRegistration')}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${platformSettings.customerRegistration ? 'bg-green-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${platformSettings.customerRegistration ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Category Management */}
                    <Card className="p-6 space-y-6">
                        <div className="border-b border-gray-100 pb-4 mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Service Categories</h2>
                                    <p className="text-sm text-gray-500">Manage available job types</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="New category name e.g. Cleaner"
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <Button size="sm" onClick={handleAddCategory} className="bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap w-full sm:w-auto px-4">
                                    <Plus size={16} className="mr-1" /> Add
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <div key={cat._id} className="group flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm hover:border-indigo-200 transition-all">
                                    <span>{cat.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                        className="w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm cursor-pointer focus:ring-2 focus:ring-red-200 focus:outline-none"
                                        aria-label={`Delete ${cat.name}`}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && !loadingCategories && (
                                <p className="text-sm text-gray-500 italic">No custom categories found. Add one above.</p>
                            )}
                            {loadingCategories && (
                                <p className="text-sm text-gray-400">Loading categories...</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
