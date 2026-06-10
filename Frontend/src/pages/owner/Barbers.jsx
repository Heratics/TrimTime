import React, { useEffect, useRef, useState } from 'react'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function OwnerBarbers() {
  const { t } = useLanguage()
  const [barbers, setBarbers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await api.get('/barbers/shop')
      setBarbers(res.data.barbers || [])
    } catch {
      setError(t('barbers_err_load'))
    }
  }

  function emptyForm() {
    return { full_name: '', bio: '', is_active: true, imageFile: null, login_email: '', login_password: '' }
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm())
    setShowForm(true)
    setError('')
  }

  function openEdit(barber) {
    setEditing(barber)
    setForm({ full_name: barber.full_name, bio: barber.bio || '', is_active: barber.is_active, imageFile: null, login_email: '', login_password: '' })
    setShowForm(true)
    setError('')
  }

  async function save() {
    if (!form.full_name.trim()) return setError(t('barbers_full_name') + ' required')
    setSubmitting(true)
    try {
      const data = new FormData()
      data.append('full_name', form.full_name)
      data.append('bio', form.bio)
      data.append('is_active', form.is_active)
      if (form.imageFile) data.append('profile_image', form.imageFile)
      if (!editing) {
        if (form.login_email) data.append('email', form.login_email)
        if (form.login_password) data.append('password', form.login_password)
        await api.post('/barbers', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.put(`/barbers/${editing.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowForm(false)
      load()
    } catch {
      setError(t('barbers_err_save'))
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleStatus(barber) {
    try {
      await api.put(`/barbers/${barber.id}`, { is_active: !barber.is_active })
      load()
    } catch {
      setError(t('barbers_err_status'))
    }
  }

  async function remove(barber) {
    if (!window.confirm(`Delete ${barber.full_name}?`)) return
    try {
      await api.delete(`/barbers/${barber.id}`)
      load()
    } catch {
      setError(t('barbers_err_delete'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{t('barbers_title')}</h1>
          <p className="text-stone-500 text-sm">{t('barbers_sub')}</p>
        </div>
        {!showForm && (
          <button onClick={openAdd} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">
            {t('barbers_add')}
          </button>
        )}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-black text-lg">{editing ? t('barbers_form_edit_title') : t('barbers_form_add_title')}</h2>
          <label className="block text-sm font-medium text-stone-700">
            {t('barbers_full_name')}
            <input
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('barbers_bio')}
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder={t('barbers_bio_placeholder')}
              rows={3}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <div>
            <p className="text-sm font-medium text-stone-700 mb-1">{t('barbers_profile_image')}</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => setForm({ ...form, imageFile: e.target.files[0] })} className="text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            {t('barbers_active_label')}
          </label>
          {!editing && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
              <p className="text-sm font-bold text-stone-700">
                {t('barbers_login_title')} <span className="font-normal text-stone-400">{t('barbers_login_optional')}</span>
              </p>
              <p className="text-xs text-stone-500">{t('barbers_login_hint')}</p>
              <label className="block text-sm font-medium text-stone-700">
                {t('barbers_login_email')}
                <input
                  type="email"
                  value={form.login_email}
                  onChange={e => setForm({ ...form, login_email: e.target.value })}
                  placeholder={t('barbers_login_email_placeholder')}
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </label>
              <label className="block text-sm font-medium text-stone-700">
                {t('barbers_login_password')}
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.login_password}
                    onChange={e => setForm({ ...form, login_password: e.target.value })}
                    placeholder={t('barbers_login_password_placeholder')}
                    className="w-full rounded-xl border px-3 py-2.5 pr-16 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500">
                    {showPassword ? t('barbers_hide') : t('barbers_show')}
                  </button>
                </div>
              </label>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={save} disabled={submitting} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {t('barbers_save')}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border px-5 py-2.5 text-sm font-bold">
              {t('barbers_cancel')}
            </button>
          </div>
        </div>
      )}

      {!barbers.length && !showForm && (
        <div className="rounded-2xl border border-dashed bg-white p-6 text-sm text-stone-500 text-center">
          {t('barbers_empty')}
        </div>
      )}

      <div className="space-y-3">
        {barbers.map(barber => (
          <div key={barber.id} className="rounded-2xl border bg-white p-4 shadow-sm flex flex-wrap items-center gap-4">
            {barber.profile_image_url
              ? <img src={barber.profile_image_url} alt="" className="h-14 w-14 rounded-full object-cover border" />
              : <div className="h-14 w-14 rounded-full bg-stone-200 flex items-center justify-center text-lg font-black text-stone-500">{barber.full_name[0]}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="font-bold">{barber.full_name}</p>
              {barber.bio && <p className="text-sm text-stone-500 truncate">{barber.bio}</p>}
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${barber.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {barber.is_active ? t('barbers_active') : t('barbers_inactive')}
                </span>
                <span className="text-xs text-stone-400">
                  {barber.user_id ? t('barbers_has_login') : t('barbers_no_login')}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => openEdit(barber)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-stone-50">
                {t('barbers_edit')}
              </button>
              <button onClick={() => toggleStatus(barber)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-stone-50">
                {barber.is_active ? t('barbers_disable') : t('barbers_enable')}
              </button>
              <button onClick={() => remove(barber)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                {t('barbers_delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}