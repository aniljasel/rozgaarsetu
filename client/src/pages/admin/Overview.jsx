import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import api from '../../api/axios';
import {
    Users,
    HardHat,
    Briefcase,
    BarChart2,
    Shield,
    TrendingUp,
    MapPin,
    CheckCircle,
    XCircle,
    Ban
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const Overview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalWorkers: 0,
        totalJobs: 0,
        pendingApprovals: 0
    });
    const [pendingWorkers, setPendingWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsRes = await api.get('/admin/stats');
                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                }

                const workersRes = await api.get('/admin/workers');
                if (workersRes.data.success) {
                    setPendingWorkers(workersRes.data.workers.filter(w => !w.isApproved));
                }
            } catch (err) {
                console.error("Failed to fetch admin dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const ANALYTICS = [
        { label: "Total Users", value: stats.totalUsers || "0", icon: Users, color: "blue", trend: "+12%" },
        { label: "Active Workers", value: stats.totalWorkers || "0", icon: HardHat, color: "orange", trend: "+5%" },
        { label: "Total Jobs", value: stats.totalJobs || "0", icon: Briefcase, color: "green", trend: "+18%" },
        { label: "Pending Approvals", value: stats.pendingApprovals || "0", icon: Shield, color: "red", trend: "Action" },
    ];

    const JOBS_DATA = stats.jobsPerDay || [
        { name: 'Mon', jobs: 0 },
        { name: 'Tue', jobs: 0 },
        { name: 'Wed', jobs: 0 },
        { name: 'Thu', jobs: 0 },
        { name: 'Fri', jobs: 0 },
        { name: 'Sat', jobs: 0 },
        { name: 'Sun', jobs: 0 },
    ];

    const CITY_DATA = stats.cityData || [
        { name: 'No Data', value: 1 }
    ];

    const RECENT_ACTIVITY = stats.recentActivity || [];

    const formatTime = (dateStr) => {
        const diffInMins = Math.round((new Date() - new Date(dateStr)) / 60000);
        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        const diffInHours = Math.floor(diffInMins / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899'];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, here's what's happening today.</p>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ANALYTICS.map((stat, idx) => (
                    <Card key={idx} className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none ring-1 ring-gray-100">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:scale-110 transition-transform`} />

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 shadow-sm`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="relative z-10 mt-4 flex items-center text-sm">
                            <span className="text-emerald-600 font-semibold flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                                <TrendingUp size={14} className="mr-1" /> {stat.trend}
                            </span>
                            <span className="text-gray-400 ml-2">vs last month</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100 min-w-0 w-full overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Jobs Per Day (Last 7 Days)</h3>
                    <div className="h-64 w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={JOBS_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#F9FAFB' }}
                                />
                                <Bar dataKey="jobs" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100 min-w-0 w-full overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Worker Locations</h3>
                    <div className="h-auto sm:h-64 flex flex-col sm:flex-row items-center justify-center w-full min-w-0 gap-8 sm:gap-0 py-4 sm:py-0">
                        <ResponsiveContainer width="100%" height={200} className="sm:h-100">
                            <PieChart>
                                <Pie
                                    data={CITY_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={6}
                                >
                                    {CITY_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="sm:ml-8 w-full sm:w-auto grid grid-cols-2 sm:grid-cols-1 gap-4 sm:gap-3 px-4 sm:px-0">
                            {CITY_DATA.map((entry, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                                    <span className="text-sm font-bold text-gray-900 ml-auto">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Verifications */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="text-indigo-600" size={24} />
                            Pending Verifications
                        </h2>
                        <Link to="/admin/verifications" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View All</Link>
                    </div>
                    <Card className="divide-y divide-gray-50 border-none shadow-sm ring-1 ring-gray-100">
                        {pendingWorkers.slice(0, 5).map(worker => (
                            <div key={worker._id || worker.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-inner">
                                        {worker.name ? String(worker.name).charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base">{worker.name || 'Unknown'}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{worker.serviceType}</span>
                                            <span className="text-gray-400 text-xs flex items-center"><MapPin size={12} className="mr-0.5" /> {(worker.address || "Location pending").substring(0, 25)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200">
                                        <XCircle size={16} className="mr-2" /> Reject
                                    </Button>
                                    <Button size="sm" className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200">
                                        <CheckCircle size={16} className="mr-2" /> Approve
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pendingWorkers.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No pending verifications at the moment.
                            </div>
                        )}
                    </Card>
                </div>

                {/* Activity Feed */}
                <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-900 px-1">Recent Jobs</h2>
                    <Card className="p-0 border-none shadow-sm ring-1 ring-gray-100 overflow-hidden">
                        {RECENT_ACTIVITY.length > 0 ? RECENT_ACTIVITY.map((job) => (
                            <div key={job._id} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 shadow-inner">
                                        <Briefcase size={20} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        <span className="font-bold text-gray-900">{job.customerId?.name || 'A customer'}</span> booked a <span className="font-bold text-indigo-600">{job.workerId?.serviceType || 'Worker'}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1.5 font-medium">{formatTime(job.createdAt)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 text-center text-gray-400 text-sm">No recent activity.</div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Overview;
