import React, { useEffect, useRef, useState } from 'react'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'
import ImageUpload from '../../components/ImageUpload'

export default function OwnerSettings() {
  const { t } = useLanguage()
  const [tab, setTab] = useState('shop')
  const [shop, setShop] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => { loadShop() }, [])

  async function loadShop() {
    try {
      const res = await api.get('/shops/me')
      setShop(res.data.shop)
      setForm({
        name: res.data.shop.name || '',
        description: res.data.shop.description || '',
        phone: res.data.shop.phone || '',
        email: res.data.shop.email || '',
        district: res.data.shop.district || '',
        address: res.data.shop.address || '',
        google_maps_url: res.data.shop.google_maps_url || '',
      })
    } catch {
      setError(t('owner_settings_err_load'))
    }
  }

  async function saveShop() {
    setSaving(true)
    setSavedMsg('')
    setError('')

    try {
      await api.put(`/shops/${shop.id}`, form)

      setSavedMsg(t('owner_settings_saved'))
      loadShop()
    } catch {
      setError(t('owner_settings_err_save'))
    } finally {
      setSaving(false)
    }
  }

  async function changePassword() {
    setPwErr(''); setPwMsg('')
    if (pw.next !== pw.confirm) return setPwErr(t('owner_pw_err_match'))
    if (pw.next.length < 8) return setPwErr(t('owner_pw_err_length'))
    setPwSaving(true)
    try {
      await api.post(`/auth/change-password`, { current_password: pw.current, new_password: pw.next })
      setPwMsg(t('owner_pw_success'))
      setPw({ current: '', next: '', confirm: '' })
    } catch {
      setPwErr(t('owner_pw_err_save'))
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">{t('owner_settings_title')}</h1>
        <p className="text-stone-500 text-sm">{t('owner_settings_sub')}</p>
      </div>

      <div className="flex gap-2 border-b">
        {[
          { key: 'shop', label: t('owner_settings_tab_shop') },
          { key: 'account', label: t('owner_settings_tab_account') },
        ].map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${tab === tb.key ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'shop' && (
        <div className="space-y-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {savedMsg && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{savedMsg}</div>}

          {!shop
            ? (
              <div className="text-center py-10">
                <p className="text-stone-500">{t('owner_settings_no_shop')}</p>
                <a href="/owner/setup" className="mt-4 inline-block rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-sm">
                  {t('owner_settings_setup_btn')}
                </a>
              </div>
            )
            : (
              <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('owner_settings_shop_name')}>
                    <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </Field>
                  <Field label={t('owner_settings_phone')}>
                    <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </Field>
                  <Field label={t('owner_settings_email')}>
                    <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </Field>
                  <Field label={t('owner_settings_district')}>
                    <input value={form.district || ''} onChange={e => setForm({ ...form, district: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </Field>
                  <Field label={t('owner_settings_address')} className="sm:col-span-2">
                    <input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </Field>
                  <Field label={t('owner_settings_maps')} className="sm:col-span-2">
                    <input value={form.google_maps_url || ''} onChange={e => setForm({ ...form, google_maps_url: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </Field>
                  <Field label={t('owner_settings_desc')} className="sm:col-span-2">
                    <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-stone-700">{t('owner_settings_logo')}</p>
                    {shop.logo_url && <img src={shop.logo_url} alt="" className="mt-1 h-16 w-16 rounded-xl object-cover border" />}
                    <ImageUpload
                      label="Shop Logo"
                      value={form.logo_url || ''}
                      onChange={v => setForm({ ...form, logo_url: v })}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">{t('owner_settings_cover')}</p>
                    {shop.cover_image_url && <img src={shop.cover_image_url} alt="" className="mt-1 h-16 w-full rounded-xl object-cover border" />}
                    <ImageUpload
                      label="Shop Cover"
                      value={form.cover_image_url || ''}
                      onChange={v => setForm({ ...form, cover_image_url: v })}
                    />
                  </div>
                </div>
                <button onClick={saveShop} disabled={saving} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                  {saving ? t('owner_settings_saving') : t('owner_settings_save')}
                </button>
              </div>
            )
          }
        </div>
      )}

      {tab === 'account' && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <div>
            <h2 className="font-black text-lg">{t('owner_pw_title')}</h2>
            <p className="text-sm text-stone-500">{t('owner_pw_sub')}</p>
          </div>
          {pwErr && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{pwErr}</div>}
          {pwMsg && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{pwMsg}</div>}
          <Field label={t('owner_pw_current')}>
            <input type="password" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </Field>
          <Field label={t('owner_pw_new')}>
            <input type="password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </Field>
          <Field label={t('owner_pw_confirm')}>
            <input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </Field>
          <button onClick={changePassword} disabled={pwSaving} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {pwSaving ? t('owner_pw_saving') : t('owner_pw_save')}
          </button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block text-sm font-medium text-stone-700 ${className}`}>
      {label}
      {children}
    </label>
  )
}