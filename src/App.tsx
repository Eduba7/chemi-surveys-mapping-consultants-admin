import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff';
import Branding from './pages/Branding';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Contact from './pages/Contact';
import Settings from './pages/Settings';
import { Spinner } from './components/UI';

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <Spinner size={36} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="staff"    element={<Staff />} />
        <Route path="branding" element={<Branding />} />
        <Route path="clients"  element={<Clients />} />
        <Route path="services" element={<Services />} />
        <Route path="projects" element={<Projects />} />
        <Route path="reports"  element={<Reports />} />
        <Route path="contact"  element={<Contact />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
