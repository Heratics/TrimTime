import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

      const user = await auth.register({
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Create Owner Account</h1>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <input
          className="mt-4 w-full rounded-lg border px-3 py-2"
          placeholder="Full Name"
          value={form.full_name}
          onChange={e => update('full_name', e.target.value)}
          required
        />

        <input
          className="mt-4 w-full rounded-lg border px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => update('email', e.target.value)}
          required
        />

        <input
          className="mt-4 w-full rounded-lg border px-3 py-2"
          placeholder="Phone"
          value={form.phone}
          onChange={e => update('phone', e.target.value)}
        />

        <input
          className="mt-4 w-full rounded-lg border px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => update('password', e.target.value)}
          required
        />

        <input
          className="mt-4 w-full rounded-lg border px-3 py-2"
          placeholder="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={e => update('confirmPassword', e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-white"
        >
          {submitting ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-medium">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  )
}