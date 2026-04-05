import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Lock, User, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { success, error } = useToast();
    const { login } = useAuth(); // Import useAuth from context

    const handleLogin = async () => {
        if (!identifier || !password) {
            error("Please enter both email/identifier and password.");
            return;
        }

        setLoading(true);
        try {
            // Note: Admin model strictly uses email in our backend schema
            const response = await api.post('/auth/admin/login', {
                email: identifier,
                password
            });

            if (response.data.success) {
                // Store auth token
                login(response.data.token, response.data.admin);
                success("Welcome back, Admin!");
                navigate('/admin/dashboard');
            }
        } catch (err) {
            console.error("Admin login error:", err);
            error(err.response?.data?.message || "Invalid Credentials. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="relative min-h-[80vh] flex items-center justify-center bg-gray-50 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-green-200/40 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-120 h-120 bg-blue-200/40 rounded-full blur-3xl opacity-50" />
                </div>

                <Card className="relative z-10 w-full max-w-md p-10 bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <ShieldCheck className="text-white w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h2>
                        <p className="text-gray-500 text-sm mt-2">Secure access for RozgaarSetu administrators</p>
                    </div>

                    <div className="flex flex-col gap-5">
                        <Input
                            label="Identifier"
                            placeholder="Phone Number / Admin ID"
                            icon={Phone}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all hover:bg-white"
                        />
                        <div className="relative">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all hover:bg-white"
                            />
                            <div className="text-right mt-1">
                                <span className="text-xs text-green-600 hover:text-green-700 cursor-pointer font-medium hover:underline">Forgot Password?</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleLogin}
                            variant="primary"
                            className="w-full py-3 mt-2 text-lg font-semibold bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200 hover:shadow-green-300 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login to Dashboard'}
                        </Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default AdminLogin;
