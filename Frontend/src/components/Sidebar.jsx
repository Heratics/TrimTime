import React from 'react'
import { NavLink } from 'react-router-dom'

const ownerItems = [
  { to: '/owner', label: 'Home' },
  { to: '/owner/appointments', label: 'Appointments' },
  { to: '/owner/barbers', label: 'Barbers' },
  { to: '/owner/services', label: 'Services' },
  { to: '/owner/scheduling', label: 'Scheduling' },
  { to: '/owner/settings', label: 'Shop Settings' },
]

const ROOT_PATHS = ['/owner', '/barber', '/admin']

export default function Sidebar({ items = ownerItems }) {
  return (
    <aside className="w-56 bg-white border-r hidden md:flex flex-col shrink-0">
      <div className="p-4 font-black text-lg tracking-tight border-b">TrimTime</div>
      <nav className="p-3 space-y-0.5 flex-1">
        {items.map(i => (
          <NavLink
            key={i.to}
            to={i.to}
            end={ROOT_PATHS.includes(i.to)}
            className={({ isActive }) =>
              isActive
                ? 'block rounded-lg px-3 py-2 text-sm font-semibold bg-stone-900 text-white'
                : 'block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50'
            }
          >
            {i.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
