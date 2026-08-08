import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';

// Simple placeholder pages for the departments
const PlaceholderPage = ({ title, module }) => {
  const { admin } = useAuth();
  
  if (admin.role !== 'superadmin' && !admin.access.includes(module)) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{title}</h1>
      <p style={{ color: '#64748b', marginTop: '10px' }}>This module is currently being built. You have authorized access to view it.</p>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!admin) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { admin, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" /> : <LoginPage />} />
      
      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<PlaceholderPage title="App Users Management" module="users" />} />
        <Route path="partners" element={<PlaceholderPage title="Partners & Vendors" module="partners" />} />
        <Route path="riders" element={<PlaceholderPage title="Delivery Fleet" module="riders" />} />
        <Route path="jobs" element={<PlaceholderPage title="HR & Candidate Recruitment" module="jobs" />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
