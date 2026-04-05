import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
    LayoutDashboard,
    Users,
    HardHat,
    Briefcase,
    Shield,
    AlertTriangle,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Check
} from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { info } = useToast();
    const { logout } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const location = useLocation();

    // Helper to format time relative to now
    const formatTime = (dateStr) => {
        const diffInMins = Math.round((new Date() - new Date(dateStr)) / 60000);
        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        const diffInHours = Math.floor(diffInMins / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    // Keep track of shown notification IDs to debounce same notification within 15 mins
    const shownNotificationsTracker = React.useRef({});

    const fetchRealDataAsNotifications = async () => {
        try {
            const [jobsRes, workersRes] = await Promise.all([
                api.get('/admin/jobs?status=pending&limit=5&sort=desc'),
                api.get('/admin/workers?isApproved=false&limit=5&sort=desc')
            ]);

            const newNotifs = [];
            const now = Date.now();
            const tenMins = 10 * 60 * 1000;

            if (jobsRes.data.success) {
                const recentJobs = jobsRes.data.jobs || [];
                recentJobs.forEach(job => {
                    const uniqueId = `job-${job._id}`;
                    // IF we haven't shown this recently (within 10 mins)
                    if (!shownNotificationsTracker.current[uniqueId] || (now - shownNotificationsTracker.current[uniqueId] > tenMins)) {
                        newNotifs.push({
                            id: uniqueId,
                            title: 'New Job Request',
                            message: `${job.serviceType || 'Service'} request from ${job.address || 'Unknown'}.`,
                            time: formatTime(job.createdAt),
                            unread: true,
                            type: 'info',
                            link: '/admin/jobs'
                        });
                        shownNotificationsTracker.current[uniqueId] = now;
                    }
                });
            }

            if (workersRes.data.success) {
                const pendingWorkers = workersRes.data.workers || [];

                pendingWorkers.forEach(worker => {
                    const uniqueId = `worker-${worker._id}`;
                    if (!shownNotificationsTracker.current[uniqueId] || (now - shownNotificationsTracker.current[uniqueId] > tenMins)) {
                        newNotifs.push({
                            id: uniqueId,
                            title: 'New Worker Registration',
                            message: `${worker.name || 'A worker'} (${worker.serviceType || 'Worker'}) requested verification.`,
                            time: formatTime(worker.createdAt),
                            unread: true,
                            type: 'alert',
                            link: '/admin/verifications'
                        });
                        shownNotificationsTracker.current[uniqueId] = now;
                    }
                });
            }

            if (newNotifs.length > 0) {
                setNotifications(prev => {
                    // Filter out existing ones with the same ID, then prepend new ones
                    const filteredPrev = prev.filter(p => !newNotifs.find(n => n.id === p.id));
                    return [...newNotifs, ...filteredPrev];
                });

                // Alert only the first new one to avoid spam
                info(`New Notification: ${newNotifs[0].title}`);
            }

        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    useEffect(() => {
        // Fetch immediately
        fetchRealDataAsNotifications();

        // Polling every 10 minute
        const interval = setInterval(() => {
            fetchRealDataAsNotifications();
        }, 600000);

        return () => clearInterval(interval);
    }, [info]);

    const MENU_ITEMS = [
        { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/users', label: 'User Management', icon: Users },
        { path: '/admin/workers', label: 'Worker Management', icon: HardHat },
        { path: '/admin/jobs', label: 'Jobs & Bookings', icon: Briefcase },
        { path: '/admin/verifications', label: 'Verifications', icon: Shield },
        { path: '/admin/reports', label: 'Reports & Complaints', icon: AlertTriangle },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;
    const unreadCount = notifications.filter(n => n.unread).length;

    const markAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans" onClick={() => setNotificationsOpen(false)}>
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30">A</div>
                            <span className="text-xl font-bold text-white tracking-wide">Admin<span className="text-indigo-400 font-normal">Panel</span></span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 relative">
                        {/* Subtle Background Glow */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full mix-blend-screen"></div>
                        <p className="px-4 text-[10.5px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                        
                        {MENU_ITEMS.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                                        ? 'text-white bg-indigo-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                                        }`}
                                >
                                    {active && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
                                    )}
                                    <item.icon
                                        size={20}
                                        className={`transition-all duration-300 ${active ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'text-slate-500 group-hover:text-slate-300'}`}
                                    />
                                    <span className="relative z-10">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer / Profile */}
                    <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-slate-700 shadow-inner flex items-center justify-center text-slate-200 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                                AD
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">Admin User</p>
                                <p className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">admin@rozgaarsetu.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 relative z-20">
                    <button onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setNotificationsOpen(!notificationsOpen);
                                }}
                                className={`p-2 rounded-full transition-colors relative cursor-pointer ${notificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up origin-top sm:origin-top-right">
                                    <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead();
                                                    setNotificationsOpen(false);
                                                }}
                                                className="text-xs text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                            >
                                                <Check size={12} /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <Link
                                                    key={n.id}
                                                    to={n.link || '/admin/dashboard'}
                                                    onClick={() => setNotificationsOpen(false)}
                                                    className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${n.unread ? 'bg-indigo-50/30' : ''}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.unread ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                                                        <div>
                                                            <p className={`text-sm ${n.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                                {n.message}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wide">
                                                                {n.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">
                                                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">No notifications</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                                        <Link to="/admin/dashboard" onClick={() => setNotificationsOpen(false)} className="block w-full py-2 text-xs font-medium text-center text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer">
                                            View All Activity
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Top Navbar Logout Button */}
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors cursor-pointer border border-red-100"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8" onClick={() => setNotificationsOpen(false)}>
                    <Outlet />
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in font-sans">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <LogOut size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium">
                                Are you sure you want to log out of the admin panel?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutConfirm(false);
                                        logout();
                                    }}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer shadow-sm shadow-red-200"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
