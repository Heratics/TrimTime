import React, { useEffect, useState } from 'react'
import {
  fetchAdminOwners,
  fetchPendingOwners,
  approveOwner,
  rejectOwner,
  disableOwner,
  deleteOwner,
} from '../../services/adminService'

export default function Owners() {
  const [tab, setTab] = useState('active')
  const [active, setActive] = useState([])
  const [pending, setPending] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [activeRes, pendingRes] = await Promise.all([
        fetchAdminOwners(),
        fetchPendingOwners(),
      ])
      setActive(activeRes.owners || [])
      setPending(pendingRes.owners || [])
    } catch {
      setError('Unable to load owners.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id) {
    if (!confirm('Approve this owner?')) return
    try {
      await approveOwner(id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to approve.')
    }
  }

  async function handleReject(id) {
    if (!confirm('Reject this owner? They will not be able to log in.')) return
    try {
      await rejectOwner(id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to reject.')
    }
  }

  async function handleDisable(owner) {
    const action = owner.status === 'disabled' ? 'Re-enable' : 'Disable'
    if (!confirm(`${action} ${owner.full_name}?`)) return
    try {
      await disableOwner(owner.id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update status.')
    }
  }

  async function handleDelete(owner) {
    if (!confirm(`Permanently delete ${owner.full_name}? This cannot be undone.`)) return
    try {
      await deleteOwner(owner.id)
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete owner.')
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Owners</h1>
        <p className="mt-1 text-sm text-gray-600">Manage shop owner accounts.</p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'active' ? 'border-stone-900 text-stone-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active
          {active.length > 0 && (
            <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs">{active.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'pending' ? 'border-stone-900 text-stone-900' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Approval
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{pending.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">Loading…</div>
      ) : tab === 'pending' ? (
        <div className="space-y-2">
          {pending.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-gray-500">
              No pending registrations.
            </div>
          ) : pending.map(owner => (
            <div key={owner.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{owner.full_name}</div>
                  <div className="text-sm text-gray-500">{owner.email}{owner.phone ? ` · ${owner.phone}` : ''}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Registered {new Date(owner.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(owner.id)}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(owner.id)}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {active.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-gray-500">
              No active owners yet.
            </div>
          ) : active.map(owner => (
            <div key={owner.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{owner.full_name}</div>
                  <div className="text-sm text-gray-500">{owner.email}{owner.phone ? ` · ${owner.phone}` : ''}</div>
                  <div className="mt-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      owner.status === 'disabled'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {owner.status === 'disabled' ? 'Disabled' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDisable(owner)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white ${
                      owner.status === 'disabled' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    {owner.status === 'disabled' ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    onClick={() => handleDelete(owner)}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}