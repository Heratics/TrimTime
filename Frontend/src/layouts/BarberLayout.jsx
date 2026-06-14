import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function BarberLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { lang, setLang, t } = useLanguage()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  function goHome() {
    navigate('/')
  }

  function toggleLang() {
    setLang(lang === 'en' ? 'ar' : 'en')
  }

  const items = [
    { to: '/barber', label: t('nav_home') },
    { to: '/barber/appointments', label: t('nav_my_appointments') },
    { to: '/barber/schedule', label: t('nav_my_schedule') },
    { to: '/barber/settings', label: t('nav_settings') },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar items={items} />
      <div className="flex-1 min-w-0">
        <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">{t('barber_dashboard')}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 flex items-center gap-1.5"
            >
              {lang === 'en' ? '🇯🇴 AR' : '🇺🇸 EN'}
            </button>
            {user && <span className="text-sm text-gray-500 hidden sm:block">{user.full_name}</span>}
            <button
              onClick={goHome}
              className="rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              {t('nav_home')}
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              {t('nav_sign_out')}
            </button>
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b bg-white p-3 md:hidden">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/barber'}
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