import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import RoleSelect from './pages/RoleSelect';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Maintenance from './pages/Maintenance';

// Worker Imports
import VoiceProfile from './pages/worker/VoiceProfile';
import SkillSelect from './pages/worker/SkillSelect';
import LocationConfirm from './pages/worker/LocationConfirm';
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerFeedback from './pages/worker/Feedback';

// Customer Imports
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerProfileSetup from './pages/customer/ProfileSetup';
import WorkerProfileView from './pages/customer/WorkerProfile';
import BookingConfirm from './pages/customer/BookingConfirm';

// Admin Imports
import AdminLogin from './pages/admin/Login';
import AdminLayout from './pages/admin/Layout';
import AdminOverview from './pages/admin/Overview';
import AdminUsers from './pages/admin/Users';
import AdminWorkers from './pages/admin/Workers';
import AdminJobs from './pages/admin/Jobs';
import AdminVerifications from './pages/admin/Verifications';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LanguagePopup from './components/LanguagePopup';

const GlobalMaintenanceWrapper = ({ children }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/settings`);
        const data = await res.json();
        if (data.success && data.settings) {
          setIsMaintenance(data.settings.maintenanceMode);
        }
      } catch (err) {
        // Silently fail if API is totally unreachable, or we could also show maintenance.
        // For now, if we can't reach the API, don't force maintenance unless we explicitly know it.
      }
    };
    
    // Check immediately
    checkSettings();

    // Check every 10 seconds
    const interval = setInterval(checkSettings, 10000);
    return () => clearInterval(interval);
  }, []);

  // Allow admin routes even in maintenance mode
  if (isMaintenance && !location.pathname.startsWith('/admin')) {
    return <Maintenance />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <LanguagePopup />
          <BrowserRouter>
            <GlobalMaintenanceWrapper>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/role-select" element={<RoleSelect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Worker Routes */}
                <Route path="/worker/profile-setup" element={<PrivateRoute allowedRoles={['worker']}><VoiceProfile /></PrivateRoute>} />
                <Route path="/worker/skill-select" element={<PrivateRoute allowedRoles={['worker']}><SkillSelect /></PrivateRoute>} />
                <Route path="/worker/location-confirm" element={<PrivateRoute allowedRoles={['worker']}><LocationConfirm /></PrivateRoute>} />
                <Route path="/worker/:tab" element={<PrivateRoute allowedRoles={['worker']}><WorkerDashboard /></PrivateRoute>} />
                <Route path="/worker/feedback" element={<PrivateRoute allowedRoles={['worker', 'customer']}><WorkerFeedback /></PrivateRoute>} />

                {/* Customer Routes */}
                <Route path="/customer/profile-setup" element={<PrivateRoute allowedRoles={['customer']}><CustomerProfileSetup /></PrivateRoute>} />
                <Route path="/customer/:tab" element={<PrivateRoute allowedRoles={['customer']}><CustomerDashboard /></PrivateRoute>} />
                <Route path="/customer/worker/:id" element={<CustomerProfileSetup />} /> {/* Keep public or protect, protecting for now to be safe, could be public view though */}
                <Route path="/customer/booking-confirm" element={<PrivateRoute allowedRoles={['customer']}><BookingConfirm /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminLayout /></PrivateRoute>}>
                  <Route index element={<AdminOverview />} /> {/* Default to dashboard */}
                  <Route path="dashboard" element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="workers" element={<AdminWorkers />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="verifications" element={<AdminVerifications />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Routes>
            </GlobalMaintenanceWrapper>
          </BrowserRouter>
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
