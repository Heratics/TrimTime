import React from 'react'
import { Navigate } from 'react-router-dom'
import auth from '../services/auth' // simple auth helper

export default function ProtectedRoute({ role, children }){
  const user = auth.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}
