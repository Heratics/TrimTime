import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function OwnerLayout(){
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <header className="p-4 border-b bg-white">
          <div className="max-w-6xl mx-auto">Owner Dashboard</div>
        </header>
        <main className="p-4 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
