import React from 'react'
import { Navigate } from 'react-router-dom'
import auth from '../services/auth'

export default function ProtectedRoute({ role, children }) {
  const user = auth.getCurrentUser()
  if (!user) return <Navigate to="/staff/login" replace />
  if (role && user.role !== role) return <Navigate to="/staff/login" replace />
  return children
}
