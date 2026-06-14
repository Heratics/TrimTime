import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ role, children }) {
  const { user, isAuthenticated, loading } = useAuth()

  // Wait for session restore before making any redirect decision
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-sm text-stone-400">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/staff/login" replace />
  if (role && user?.role !== role) return <Navigate to="/staff/login" replace />
  return children
}