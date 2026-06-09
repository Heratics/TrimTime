import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ShopCard from '../../components/public/ShopCard'
import { fetchPublicShops } from '../../services/publicShopService'
import { useLanguage } from '../../context/LanguageContext'

export default function Shops() {
  const [searchParams] = useSearchParams()
  const { t } = useLanguage()
  const [filters, setFilters] = useState({ search: searchParams.get('search') || '', district: '', open_now: false })
  const [shops, setShops] = useState([])
  const [districts, setDistricts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPublicShops(filters)
      .then(response => { setShops(response.shops || []); setDistricts(response.districts || []); setError('') })
      .catch(() => setError(t('shops_error')))
  }, [filters.search, filters.district, filters.open_now])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <p className="text-sm font-bold uppercase tracking-wider text-amber-700">{t('shops_region')}</p>
        <h1 className="text-3xl font-black">{t('shops_heading')}</h1>
        <p className="mt-2 text-stone-600">{t('shops_sub')}</p>
      </header>
      <div className="mt-6 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-3">
        <input
          value={filters.search}
          onChange={event => setFilters({ ...filters, search: event.target.value })}
          placeholder={t('shops_search_placeholder')}
          className="rounded-xl border px-3 py-3"
        />
        <select
          value={filters.district}
          onChange={event => setFilters({ ...filters, district: event.target.value })}
          className="rounded-xl border bg-white px-3 py-3"
        >
          <option value="">{t('shops_all_districts')}</option>
          {districts.map(district => <option key={district}>{district}</option>)}
        </select>
        <label className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={filters.open_now}
            onChange={event => setFilters({ ...filters, open_now: event.target.checked })}
          />
          {t('shops_open_now')}
        </label>
      </div>
      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map(shop => <ShopCard key={shop.id} shop={shop} />)}
      </div>
      {!error && shops.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed bg-white p-5 text-sm text-stone-500">
          {t('shops_empty')}
        </div>
      )}
    </div>
  )
}