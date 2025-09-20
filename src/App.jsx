import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import AuthLanding from './pages/AuthLanding.jsx'; // new combined page
import { getToken } from './auth.js';

export default function App() {
  const authed = !!getToken();

  return (
    <Routes>
      {/* Unauthenticated users see the landing/login/register page */}
      <Route path="/auth" element={<AuthLanding />} />

      {/* Redirect /login and /register to /auth for simplicity */}
      <Route path="/login" element={<Navigate to="/auth" />} />
      <Route path="/register" element={<Navigate to="/auth" />} />

      {/* Protected routes */}
      <Route path="/*" element={authed ? <Dashboard /> : <Navigate to="/auth" />} />
    </Routes>
  );
}
