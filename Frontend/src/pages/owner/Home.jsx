import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboardMetrics } from '../../services/ownerService'
import api from '../../services/api'

export default function Home() {
  const [metrics, setMetrics] = useState(null)
  const [hasShop, setHasShop] = useState(null) // null = loading, true/false = known
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if owner has a shop first
    api.get('/shops/me')
      .then(() => {
        setHasShop(true)
        return fetchDashboardMetrics()
      })
      .then(d => setMetrics(d))
      .catch(err => {
        if (err?.response?.status === 404) {
          setHasShop(false)
        } else {
          setHasShop(true)
          setError('Unable to load dashboard metrics.')
        }
      })
  }, [])

  if (hasShop === null) {
    return <div className="py-10 text-center text-sm text-gray-500">Loading…</div>
  }

  if (hasShop === false) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-4xl mb-4">✂️</div>
          <h1 className="text-2xl font-black">Welcome to TrimTime</h1>
          <p className="mt-2 text-gray-600">
            You don't have a shop yet. Set one up to start managing appointments and barbers.
          </p>
          <Link
            to="/owner/setup"
            className="mt-6 inline-block rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white"
          >
            Set Up My Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Overview of your shop's activity.</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Metric label="Total appointments" value={metrics?.total_appointments} />
        <Metric label="Pending" value={metrics?.pending_appointments} color="text-amber-600" />
        <Metric label="Confirmed" value={metrics?.confirmed_appointments} color="text-blue-600" />
        <Metric label="Completed" value={metrics?.completed_appointments} color="text-green-600" />
        <Metric label="Active barbers" value={metrics?.active_barbers} />
        <Metric label="Active services" value={metrics?.active_services} />
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <QuickLink to="/owner/appointments" label="View Appointments" />
        <QuickLink to="/owner/barbers" label="Manage Barbers" />
        <QuickLink to="/owner/services" label="Manage Services" />
        <QuickLink to="/owner/scheduling" label="Scheduling" />
        <QuickLink to="/owner/settings" label="Settings" />
      </div>
    </div>
  )
}

function Metric({ label, value, color = 'text-stone-900' }) {
  return (
    <div className="p-4 bg-white rounded-xl border shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <strong className={`mt-1 block text-2xl font-black ${color}`}>{value ?? '-'}</strong>
    </div>
  )
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center"
    >
      {label}
    </Link>
  )
}
