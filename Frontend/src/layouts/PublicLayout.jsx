import React, { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { lang, setLang, t } = useLanguage()

  function toggleLang() {
    setLang(lang === 'en' ? 'ar' : 'en')
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-black tracking-tight">TrimTime</Link>
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm md:hidden"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <PublicNavLink to="/">{t('nav_home')}</PublicNavLink>
            <PublicNavLink to="/shops">{t('nav_find_barber')}</PublicNavLink>
            <Link to="/staff/login" className="rounded-lg border px-4 py-2 hover:bg-stone-100">
              {t('nav_login')}
            </Link>
            <Link to="/staff/register" className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black">
              {t('nav_register')}
            </Link>
            <button
              onClick={toggleLang}
              className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-stone-100 flex items-center gap-1.5"
            >
              {lang === 'en' ? '🇯🇴 AR' : '🇺🇸 EN'}
            </button>
          </nav>
        </div>
        {open && (
          <nav className="space-y-2 border-t bg-white px-4 py-3 text-sm font-medium md:hidden">
            <PublicNavLink to="/" onClick={() => setOpen(false)}>{t('nav_home')}</PublicNavLink>
            <PublicNavLink to="/shops" onClick={() => setOpen(false)}>{t('nav_find_barber')}</PublicNavLink>
            <Link
              to="/staff/login"
              onClick={() => setOpen(false)}
              className="block rounded-lg border px-3 py-2 text-center hover:bg-stone-100"
            >
              {t('nav_login')}
            </Link>
            <Link
              to="/staff/register"
              onClick={() => setOpen(false)}
              className="block rounded-lg bg-amber-500 px-3 py-2 text-center font-semibold text-black"
            >
              {t('nav_register')}
            </Link>
            <button
              onClick={() => { toggleLang(); setOpen(false) }}
              className="w-full rounded-lg border px-3 py-2 text-center text-sm font-semibold hover:bg-stone-100"
            >
              {lang === 'en' ? '🇯🇴 AR' : '🇺🇸 EN'}
            </button>
          </nav>
        )}
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} TrimTime Aqaba
      </footer>
    </div>
  )
}

function PublicNavLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 ${isActive ? 'bg-stone-100 text-stone-950' : 'text-stone-600 hover:text-stone-950'}`
      }
    >
      {children}
    </NavLink>
  )
}