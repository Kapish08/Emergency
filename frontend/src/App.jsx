/**
 * App.jsx — Main router and layout
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';

import Sidebar from './components/Sidebar';
import SOSButton from './components/SOSButton';
import AuthPage from './pages/AuthPage';
import EmergencyFinder from './pages/EmergencyFinder';
import Dashboard from './pages/Dashboard';
import HealthMonitor from './pages/HealthMonitor';
import AmbulanceTracker from './pages/AmbulanceTracker';
import SettingsPage from './pages/SettingsPage';
import MyBookings from './pages/MyBookings';

// Protected layout wrapper
const AppLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content animate-fade-in">
        {children}
      </main>
      <SOSButton />
    </div>
  );
};

// Route guard
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/finder" replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={
      <PublicRoute><AuthPage /></PublicRoute>
    } />

    {/* Protected */}
    <Route path="/dashboard" element={
      <PrivateRoute>
        <AppLayout><Dashboard /></AppLayout>
      </PrivateRoute>
    } />
    <Route path="/finder" element={
      <PrivateRoute>
        <AppLayout><EmergencyFinder /></AppLayout>
      </PrivateRoute>
    } />
    <Route path="/bookings" element={
      <PrivateRoute>
        <AppLayout><MyBookings /></AppLayout>
      </PrivateRoute>
    } />
    <Route path="/health" element={
      <PrivateRoute>
        <AppLayout><HealthMonitor /></AppLayout>
      </PrivateRoute>
    } />
    <Route path="/ambulance" element={
      <PrivateRoute>
        <AppLayout><AmbulanceTracker /></AppLayout>
      </PrivateRoute>
    } />
    <Route path="/settings" element={
      <PrivateRoute>
        <AppLayout><SettingsPage /></AppLayout>
      </PrivateRoute>
    } />

    {/* Redirects */}
    <Route path="/" element={<Navigate to="/finder" replace />} />
    <Route path="*" element={<Navigate to="/finder" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);

export default App;
