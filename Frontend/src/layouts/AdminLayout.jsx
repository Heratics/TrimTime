import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import auth from '../services/auth'

const items = [
  { to: '/admin', label: 'Home' },
  { to: '/admin/shops', label: 'Shops' },
  { to: '/admin/owners', label: 'Owners' },
  { to: '/admin/barbers', label: 'Barbers' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/appointments', label: 'Appointments' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const user = auth.getCurrentUser()

  function logout() {
    auth.logout()
    navigate('/staff/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar items={items} />
      <div className="flex-1 min-w-0">
        <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">Platform Admin</span>
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
        <nav className="flex gap-2 overflow-x-auto border-b bg-white p-3 md:hidden">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-2 text-sm ${isActive ? 'bg-gray-900 text-white' : 'border bg-white text-gray-700'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto max-w-6xl p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
