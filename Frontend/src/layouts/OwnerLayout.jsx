import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import auth from '../services/auth'

export default function OwnerLayout() {
  const navigate = useNavigate()
  const user = auth.getCurrentUser()

  function logout() {
    auth.logout()
    navigate('/staff/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">Owner Dashboard</span>
          <div className="flex items-center gap-3">
            {user && <span className="text-sm text-gray-500 hidden sm:block">{user.full_name}</span>}
            <button
              onClick={logout}
              className="rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </header>
        <main className="p-4 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
