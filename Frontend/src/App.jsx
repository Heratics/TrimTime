import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import OwnerLayout from './layouts/OwnerLayout'
import BarberLayout from './layouts/BarberLayout'
import AdminLayout from './layouts/AdminLayout'
import OwnerHome from './pages/owner/Home'
import OwnerAppointments from './pages/owner/Appointments'
import Barbers from './pages/owner/Barbers'
import Services from './pages/owner/Services'
import Scheduling from './pages/owner/Scheduling'
import Settings from './pages/owner/Settings'
import BarberHome from './pages/barber/Home'
import BarberAppointments from './pages/barber/Appointments'
import BarberSchedule from './pages/barber/Schedule'
import AdminHome from './pages/admin/Home'
import AdminShops from './pages/admin/Shops'
import AdminOwners from './pages/admin/Owners'
import AdminBarbers from './pages/admin/Barbers'
import AdminServices from './pages/admin/Services'
import AdminAppointments from './pages/admin/Appointments'
import Login from './pages/Auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import auth from './services/auth'

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerLayout /></ProtectedRoute>}>
        <Route index element={<OwnerHome />} />
        <Route path="appointments" element={<OwnerAppointments />} />
        <Route path="barbers" element={<Barbers />} />
        <Route path="services" element={<Services />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/barber" element={<ProtectedRoute role="barber"><BarberLayout /></ProtectedRoute>}>
        <Route index element={<BarberHome />} />
        <Route path="appointments" element={<BarberAppointments />} />
        <Route path="schedule" element={<BarberSchedule />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminHome />} />
        <Route path="shops" element={<AdminShops />} />
        <Route path="owners" element={<AdminOwners />} />
        <Route path="barbers" element={<AdminBarbers />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="appointments" element={<AdminAppointments />} />
      </Route>

      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  )
}

function RoleRedirect(){
  const user = auth.getCurrentUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'barber') return <Navigate to="/barber" replace />
  if (user.role === 'owner') return <Navigate to="/owner" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/login" replace />
}
