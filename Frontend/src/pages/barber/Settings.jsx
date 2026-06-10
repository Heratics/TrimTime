import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import ImageUpload from '../../components/ImageUpload'
import { useLanguage } from '../../context/LanguageContext'

export default function Settings() {
  const { t } = useLanguage()
  const [tab, setTab] = useState('profile')

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">{t('barber_settings_title')}</h1>
      <p className="text-sm text-gray-500 mb-2">{t('barber_settings_sub')}</p>
      <div className="flex gap-2 border-b mb-6">
        {[
          { key: 'profile', label: t('barber_settings_tab_profile') },
          { key: 'account', label: t('barber_settings_tab_account') },
        ].map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === tb.key ? 'border-stone-900 text-stone-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>
      {tab === 'profile' ? <ProfileSettings t={t} /> : <AccountSettings t={t} />}
    </div>
  )
}

function ProfileSettings({ t }) {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/barber/dashboard')
      .then(r => {
        const b = r.data.barber
        setForm({ full_name: b.full_name || '', bio: b.bio || '', profile_image_url: b.profile_image_url || '' })
      })
      .catch(() => setError(t('barber_profile_err_load')))
  }, [])

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function save(e) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      await api.put('/barber/profile', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.error || t('barber_profile_err_save'))
    } finally {
      setSaving(false)
    }
  }

  if (form === null) return <div className="py-10 text-center text-sm text-gray-500">Loading…</div>

  return (
    <div className="max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-1">{t('barber_profile_title')}</h2>
      <p className="text-sm text-gray-500 mb-4">{t('barber_profile_sub')}</p>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {saved && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{t('barber_profile_saved')}</div>}
      <form onSubmit={save} className="space-y-4">
        <ImageUpload
          label={t('barber_profile_photo')}
          value={form.profile_image_url}
          onChange={v => update('profile_image_url', v)}
        />
        <Field label={t('barber_profile_name')}>
          <input value={form.full_name} onChange={e => update('full_name', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <Field label={t('barber_profile_bio')}>
          <textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2.5" placeholder={t('barber_profile_bio_placeholder')} />
        </Field>
        <button type="submit" disabled={saving} className="rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
          {saving ? t('barber_profile_saving') : t('barber_profile_save')}
        </button>
      </form>
    </div>
  )
}

function AccountSettings({ t }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) return setError(t('owner_pw_err_match'))
    if (form.new_password.length < 8) return setError(t('owner_pw_err_length'))
    setSaving(true); setError(''); setSuccess(false)
    try {
      await api.put('/auth/password', { current_password: form.current_password, new_password: form.new_password })
      setSuccess(true)
      setForm({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.error || t('owner_pw_err_save'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-1">{t('owner_pw_title')}</h2>
      <p className="text-sm text-gray-500 mb-4">{t('owner_pw_sub')}</p>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{t('owner_pw_success')}</div>}
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('owner_pw_current')}>
          <input type="password" value={form.current_password} onChange={e => update('current_password', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <Field label={t('owner_pw_new')}>
          <input type="password" value={form.new_password} onChange={e => update('new_password', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <Field label={t('owner_pw_confirm')}>
          <input type="password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <button type="submit" disabled={saving} className="rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
          {saving ? t('owner_pw_saving') : t('owner_pw_save')}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}