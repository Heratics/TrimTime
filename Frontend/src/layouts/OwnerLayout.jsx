import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function OwnerLayout() {
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-700">{t('owner_dashboard')}</span>
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
        <main className="p-4 pt-16 md:pt-4 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}