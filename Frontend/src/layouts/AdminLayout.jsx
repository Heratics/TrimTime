import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const items = [
  { to: '/admin', label: 'Home' },
  { to: '/admin/shops', label: 'Shops' },
  { to: '/admin/owners', label: 'Owners' },
  { to: '/admin/barbers', label: 'Barbers' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/appointments', label: 'Appointments' },
]

export default function AdminLayout(){
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar items={items} />
      <div className="flex-1">
        <header className="border-b bg-white p-4">
          <div className="mx-auto max-w-6xl">Platform Admin Dashboard</div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b bg-white p-3 md:hidden">
          {items.map(item=>(
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive })=>`whitespace-nowrap rounded-full px-3 py-2 text-sm ${isActive ? 'bg-gray-900 text-white' : 'border bg-white text-gray-700'}`}
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
