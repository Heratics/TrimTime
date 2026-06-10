import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function BarberHome() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/barber/dashboard/stats')
        setStats(res.data)
      } catch {
        setError(t('barber_err_dashboard'))
      }
    }
    load()
  }, [])

  const metrics = [
    { label: t('barber_metric_today'), value: stats?.today ?? '-' },
    { label: t('barber_metric_upcoming'), value: stats?.upcoming ?? '-' },
    { label: t('barber_metric_pending'), value: stats?.pending ?? '-' },
    { label: t('barber_metric_confirmed'), value: stats?.confirmed ?? '-' },
    { label: t('barber_metric_completed'), value: stats?.completed ?? '-' },
    { label: t('barber_metric_total'), value: stats?.total ?? '-' },
  ]

  const quickLinks = [
    { to: '/barber/appointments', label: t('barber_quick_appointments') },
    { to: '/barber/schedule', label: t('barber_quick_schedule') },
    { to: '/barber/settings', label: t('barber_quick_settings') },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">{t('barber_home_title')}</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map(metric => (
          <div key={metric.label} className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-stone-500">{metric.label}</p>
            <p className="mt-1 text-3xl font-black">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {quickLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-2xl border bg-white p-4 text-sm font-semibold shadow-sm hover:bg-stone-50"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}