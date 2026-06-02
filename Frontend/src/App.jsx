import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import OwnerLayout from './layouts/OwnerLayout'
import Home from './pages/owner/Home'
import Appointments from './pages/owner/Appointments'
import Barbers from './pages/owner/Barbers'
import Services from './pages/owner/Services'
import Scheduling from './pages/owner/Scheduling'
import Settings from './pages/owner/Settings'
import Login from './pages/Auth/Login'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerLayout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="barbers" element={<Barbers />} />
        <Route path="services" element={<Services />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/owner" replace />} />
    </Routes>
  )
}
