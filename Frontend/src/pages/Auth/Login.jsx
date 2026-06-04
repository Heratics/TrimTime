import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import auth from '../../services/auth'

export default function Login(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event){
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const user = await auth.login(email, password)
      navigate(user.role === 'barber' ? '/barber' : user.role === 'owner' ? '/owner' : user.role === 'admin' ? '/admin' : '/', { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Sign in to TrimTime</h1>
        <p className="mt-1 text-sm text-gray-600">Use your TrimTime account.</p>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <label className="mt-4 block text-sm font-medium text-gray-700">
          Email
          <input type="email" required value={email} onChange={event=>setEmail(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="mt-4 block text-sm font-medium text-gray-700">
          Password
          <input type="password" required value={password} onChange={event=>setPassword(event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-gray-900 hover:underline"
              >
                Create Account
              </Link>
            </p>  
      </form>
    </div>
  )
}
