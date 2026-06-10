import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function SetupShop() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    district: '',
    address: '',
    google_maps_url: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const logoRef = useRef()
  const coverRef = useRef()

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError(t('setup_name') + ' required')
    setSubmitting(true)
    setError('')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (logoRef.current?.files[0]) data.append('logo', logoRef.current.files[0])
      if (coverRef.current?.files[0]) data.append('cover_image', coverRef.current.files[0])
      await api.post('/owner/shop', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate('/owner', { replace: true })
    } catch {
      setError(t('setup_err'))
    } finally {
      setSubmitting(false)
    }
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black">{t('setup_title')}</h1>
        <p className="text-sm text-stone-500">{t('setup_sub')}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={submit} className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
            {t('setup_name')}
            <input
              value={form.name}
              onChange={e => update('name', e.target.value)}
              required
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
            {t('setup_desc')}
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder={t('setup_desc_placeholder')}
              rows={3}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('setup_phone')}
            <input
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('setup_email')}
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('setup_district')}
            <input
              value={form.district}
              onChange={e => update('district', e.target.value)}
              placeholder={t('setup_district_placeholder')}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('setup_address')}
            <input
              value={form.address}
              onChange={e => update('address', e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
            {t('setup_maps')}
            <input
              value={form.google_maps_url}
              onChange={e => update('google_maps_url', e.target.value)}
              placeholder={t('setup_maps_placeholder')}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-stone-700">{t('setup_logo')}</p>
            <input ref={logoRef} type="file" accept="image/*" className="mt-2 text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">{t('setup_cover')}</p>
            <input ref={coverRef} type="file" accept="image/*" className="mt-2 text-sm" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-stone-900 px-5 py-3 font-bold text-white disabled:opacity-50"
        >
          {submitting ? t('setup_submitting') : t('setup_submit')}
        </button>
      </form>
    </div>
  )
}