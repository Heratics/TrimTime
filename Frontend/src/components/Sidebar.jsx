import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const ROOT_PATHS = ['/owner', '/barber', '/admin']

export default function Sidebar({ items }) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()

  const ownerItems = [
    { to: '/owner', label: t('nav_home') },
    { to: '/owner/appointments', label: t('nav_appointments') },
    { to: '/owner/barbers', label: t('nav_barbers') },
    { to: '/owner/services', label: t('nav_services') },
    { to: '/owner/scheduling', label: t('nav_scheduling') },
    { to: '/owner/products', label: t('nav_products') },
    { to: '/owner/settings', label: t('nav_settings') },
  ]

  const navItems = items || ownerItems

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-56 bg-white border-r hidden md:flex flex-col shrink-0">
        <Link to="/" className="p-4 font-black text-lg tracking-tight border-b hover:text-stone-600 transition-colors">TrimTime</Link>
        <nav className="p-3 space-y-0.5 flex-1">
          {navItems.map(i => (
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

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-black text-lg tracking-tight">TrimTime</Link>
        <button onClick={() => setOpen(o => !o)} className="p-2 rounded-lg hover:bg-gray-100">
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setOpen(false)}>
          <div className="w-64 h-full bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 font-black text-lg border-b">TrimTime</div>
            <nav className="p-3 space-y-0.5">
              {navItems.map(i => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  end={ROOT_PATHS.includes(i.to)}
                  onClick={() => setOpen(false)}
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
          </div>
        </div>
      )}
    </>
  )
}