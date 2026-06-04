import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import auth from '../../services/auth'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.')
    }
    try {
      setSubmitting(true)
      setError('')
      await auth.register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'owner'
      })
      navigate('/owner', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight">TrimTime</h1>
          <p className="mt-1 text-sm text-stone-500">Create your owner account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-stone-700">
            Full Name
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Email
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Phone
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Password
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              type="password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Confirm Password
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
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-stone-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="mt-4 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <a href="/staff/login" className="font-medium text-stone-900 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  )
}
