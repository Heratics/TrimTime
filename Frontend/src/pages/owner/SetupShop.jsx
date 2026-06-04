import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function SetupShop() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    district: '',
    address: '',
    google_maps_url: '',
    logo_url: '',
    cover_image_url: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // If owner already has a shop, redirect to dashboard
    api.get('/shops/me')
      .then(() => navigate('/owner', { replace: true }))
      .catch(() => {}) // 404 = no shop yet, stay on this page
  }, [navigate])

  function update(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/shops', {
        ...form,
        city: 'Aqaba',
        country: 'Jordan',
      })
      navigate('/owner', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || 'Failed to create shop.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <h1 className="text-2xl font-black mb-1">Set Up Your Shop</h1>
      <p className="text-sm text-gray-500 mb-6">
        This information will appear on your public shop page in Aqaba.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <Field label="Shop Name *">
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            required
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            rows={3}
            className="w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            placeholder="Tell customers about your shop…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone">
            <input
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="District">
            <input
              value={form.district}
              onChange={e => update('district', e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5"
              placeholder="e.g. Al-Rawnaq"
            />
          </Field>
          <Field label="Address">
            <input
              value={form.address}
              onChange={e => update('address', e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </Field>
        </div>

        <Field label="Google Maps URL">
          <input
            value={form.google_maps_url}
            onChange={e => update('google_maps_url', e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5"
            placeholder="https://maps.google.com/…"
          />
        </Field>

        <Field label="Logo URL">
          <input
            value={form.logo_url}
            onChange={e => update('logo_url', e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5"
            placeholder="https://…"
          />
        </Field>

        <Field label="Cover Image URL">
          <input
            value={form.cover_image_url}
            onChange={e => update('cover_image_url', e.target.value)}
            className="w-full rounded-lg border px-3 py-2.5"
            placeholder="https://…"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Creating shop…' : 'Create My Shop'}
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
