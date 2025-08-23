
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { getToken } from './auth.js'

export default function App(){
  const authed = !!getToken()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={authed ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  )
}
