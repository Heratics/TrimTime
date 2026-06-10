import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function Register() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'owner'
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pending, setPending] = useState(false)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (form.role === 'barber') {
      return setError(t('register_barber_warning'))
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.')
    }
    try {
      setSubmitting(true)
      setError('')
      await api.post('/auth/register', {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role
      })
      setPending(true)
    } catch (err) {
      setError(err?.response?.data?.error || t('register_failed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (pending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-black tracking-tight mb-2">TrimTime</h1>
          <h2 className="text-lg font-semibold mb-2">{t('register_pending_title')}</h2>
          <p className="text-sm text-stone-500 mb-6">{t('register_pending_body')}</p>
          <a href="/staff/login" className="text-sm font-medium text-stone-900 hover:underline">
            {t('register_back_signin')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-2 text-left">
          <Link to="/" className="text-sm text-stone-500 hover:text-stone-800">{t('register_back_home')}</Link>
        </div>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight">TrimTime</h1>
          <p className="mt-1 text-sm text-stone-500">{t('register_create_account')}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-stone-700">
            {t('register_account_type')}
            <select
            className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-white"
            value={form.role}
            onChange={e => update('role', e.target.value)}
            >
            <option value="owner">{t('register_shop_owner')}</option>
          </select>
          </label>

          {form.role === 'barber' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {t('register_barber_warning')}
            </div>
          )}

          <label className="block text-sm font-medium text-stone-700">
            {t('register_full_name')}
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('register_email')}
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('register_phone')}
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('register_password')}
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              type="password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('register_confirm_password')}
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              type="password"
              value={form.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || form.role === 'barber'}
          className="mt-6 w-full rounded-lg bg-stone-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? t('register_submitting') : t('register_submit')}
        </button>

        <p className="mt-4 text-center text-sm text-stone-500">
          {t('register_have_account')}{' '}
          <a href="/staff/login" className="font-medium text-stone-900 hover:underline">
            {t('register_sign_in')}
          </a>
        </p>
      </form>
    </div>
  )
}