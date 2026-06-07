import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import auth from '../../services/auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const user = await auth.login(email, password)
      if (user.role === 'barber') navigate('/barber', { replace: true })
      else if (user.role === 'owner') navigate('/owner', { replace: true })
      else if (user.role === 'admin') navigate('/admin', { replace: true })
      else navigate('/', { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-2 text-left">
          <Link to="/" className="text-sm text-stone-500 hover:text-stone-800">← Back to Home</Link>
        </div>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black tracking-tight">TrimTime</h1>
          <p className="mt-1 text-sm text-stone-500">Staff sign in</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-stone-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-stone-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-stone-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
