import React from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/owner', label: 'Home' },
  { to: '/owner/appointments', label: 'Appointments' },
  { to: '/owner/barbers', label: 'Barbers' },
  { to: '/owner/services', label: 'Services' },
  { to: '/owner/scheduling', label: 'Scheduling' },
  { to: '/owner/settings', label: 'Shop Settings' }
]

export default function Sidebar(){
  return (
    <aside className="w-64 bg-white border-r hidden md:block">
      <div className="p-4 font-bold">TrimTime</div>
      <nav className="p-4 space-y-1">
        {items.map(i=> (
          <NavLink key={i.to} to={i.to} className={({isActive})=> isActive ? 'block p-2 rounded bg-gray-100' : 'block p-2 rounded hover:bg-gray-50'}>{i.label}</NavLink>
        ))}
      </nav>
    </aside>
  )
}
