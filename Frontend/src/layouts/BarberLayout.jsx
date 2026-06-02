import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const items = [
  { to: '/barber', label: 'Home' },
  { to: '/barber/appointments', label: 'My Appointments' },
  { to: '/barber/schedule', label: 'My Schedule' },
]

export default function BarberLayout(){
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar items={items} />
      <div className="flex-1">
        <header className="border-b bg-white p-4">
          <div className="mx-auto max-w-6xl">Barber Dashboard</div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b bg-white p-3 md:hidden">
          {items.map(item=>(
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/barber'}
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
