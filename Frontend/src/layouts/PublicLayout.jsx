import React, { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

export default function PublicLayout(){
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-black tracking-tight">TrimTime</Link>
          <button type="button" className="rounded-lg border px-3 py-2 text-sm md:hidden" onClick={()=>setOpen(!open)}>Menu</button>
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <PublicNavLink to="/">Home</PublicNavLink>
            <PublicNavLink to="/shops">Find a Barber</PublicNavLink>
            <Link to="/login" className="rounded-full bg-stone-900 px-4 py-2 text-white">Sign In</Link>
          </nav>
        </div>
        {open && (
          <nav className="space-y-2 border-t bg-white px-4 py-3 text-sm font-medium md:hidden">
            <PublicNavLink to="/" onClick={()=>setOpen(false)}>Home</PublicNavLink>
            <PublicNavLink to="/shops" onClick={()=>setOpen(false)}>Find a Barber</PublicNavLink>
            <Link to="/login" onClick={()=>setOpen(false)} className="block rounded-lg bg-stone-900 px-3 py-2 text-white">Sign In</Link>
          </nav>
        )}
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-500">TrimTime Aqaba MVP</footer>
    </div>
  )
}

function PublicNavLink({ to, children, onClick }){
  return <NavLink to={to} end={to === '/'} onClick={onClick} className={({ isActive })=>`block rounded-lg px-3 py-2 ${isActive ? 'bg-stone-100 text-stone-950' : 'text-stone-600 hover:text-stone-950'}`}>{children}</NavLink>
}
