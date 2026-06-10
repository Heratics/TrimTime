import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function OwnerServices() {
  const { t } = useLanguage()
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await api.get('/owner/services')
      setServices(res.data.services || [])
    } catch {
      setError('Unable to load services.')
    }
  }

  function emptyForm() {
    return { name: '', category: '', description: '', duration_minutes: '', price: '', is_active: true }
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm())
    setShowForm(true)
    setError('')
  }

  function openEdit(service) {
    setEditing(service)
    setForm({
      name: service.name,
      category: service.category || '',
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active
    })
    setShowForm(true)
    setError('')
  }

  async function save() {
    setSubmitting(true)
    try {
      if (editing) {
        await api.put(`/owner/services/${editing.id}`, form)
      } else {
        await api.post('/owner/services', form)
      }
      setShowForm(false)
      load()
    } catch {
      setError('Failed to save service.')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleStatus(service) {
    try {
      await api.patch(`/owner/services/${service.id}/status`, { is_active: !service.is_active })
      load()
    } catch {
      setError('Failed to update service.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">{t('services_title')}</h1>
        {!showForm && (
          <button onClick={openAdd} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">
            {t('services_add')}
          </button>
        )}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={t('services_name_placeholder')}
              className="rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <input
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              placeholder={t('services_category_placeholder')}
              className="rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={t('services_desc_placeholder')}
              className="rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900 sm:col-span-2"
            />
            <input
              type="number"
              value={form.duration_minutes}
              onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
              placeholder={t('services_duration_placeholder')}
              className="rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder={t('services_price_placeholder')}
              className="rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-2">
            <button onClick={save} disabled={submitting} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {t('services_save')}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border px-5 py-2.5 text-sm font-bold">
              {t('services_cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {services.map(service => (
          <div key={service.id} className="rounded-2xl border bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">{service.name}</p>
              {service.category && <p className="text-xs text-stone-400">{service.category}</p>}
              <p className="text-sm text-stone-500 mt-0.5">{service.duration_minutes} min · {service.price} JOD</p>
              {service.description && <p className="text-sm text-stone-400 mt-0.5">{service.description}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(service)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-stone-50">
                {t('barbers_edit')}
              </button>
              <button onClick={() => toggleStatus(service)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-stone-50">
                {service.is_active ? t('services_disable') : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}