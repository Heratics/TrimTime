import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function OwnerHome() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [shop, setShop] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [shopRes, statsRes] = await Promise.all([
          api.get('/owner/shop'),
          api.get('/owner/dashboard')
        ])
        setShop(shopRes.data.shop)
        setStats(statsRes.data)
      } catch {
        setShop(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="text-stone-500">{t('owner_home_loading')}</p>

  if (!shop) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">✂️</div>
      <h2 className="text-2xl font-black">{t('owner_home_no_shop_title')}</h2>
      <p className="mt-2 text-stone-500 max-w-sm">{t('owner_home_no_shop_sub')}</p>
      <Link to="/owner/setup" className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-bold">
        {t('owner_home_setup_btn')}
      </Link>
    </div>
  )

  const metrics = [
    { label: t('owner_metric_total'), value: stats?.total ?? '-' },
    { label: t('owner_metric_pending'), value: stats?.pending ?? '-' },
    { label: t('owner_metric_confirmed'), value: stats?.confirmed ?? '-' },
    { label: t('owner_metric_completed'), value: stats?.completed ?? '-' },
    { label: t('owner_metric_barbers'), value: stats?.active_barbers ?? '-' },
    { label: t('owner_metric_services'), value: stats?.active_services ?? '-' },
  ]

  const quickLinks = [
    { to: '/owner/appointments', label: t('owner_quick_appointments') },
    { to: '/owner/barbers', label: t('owner_quick_barbers') },
    { to: '/owner/services', label: t('owner_quick_services') },
    { to: '/owner/scheduling', label: t('owner_quick_scheduling') },
    { to: '/owner/products', label: t('owner_quick_products') },
    { to: '/owner/settings', label: t('owner_quick_settings') },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">{t('owner_home_title')}</h1>
        <p className="text-stone-500">{t('owner_home_sub')}</p>
      </div>
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
          <Link key={link.to} to={link.to} className="rounded-2xl border bg-white p-4 text-sm font-semibold shadow-sm hover:bg-stone-50">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}