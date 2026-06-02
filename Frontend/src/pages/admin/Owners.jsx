import React, { useEffect, useState } from 'react'
import { fetchAdminOwners } from '../../services/adminService'

export default function Owners(){
  const [owners, setOwners] = useState([])
  const [error, setError] = useState('')

  useEffect(()=>{ fetchAdminOwners().then(response=>setOwners(response.owners || [])).catch(()=>setError('Unable to load owners.')) },[])

  return (
    <div className="space-y-4">
      <header><h1 className="text-2xl font-bold">All Owners</h1><p className="mt-1 text-sm text-gray-600">Registered shop owner accounts.</p></header>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="space-y-2">
        {owners.map(owner=><div key={owner.id} className="rounded-xl border bg-white p-4 shadow-sm"><div className="font-semibold">{owner.full_name}</div><div className="text-sm text-gray-600">{owner.email}{owner.phone ? ` - ${owner.phone}` : ''}</div></div>)}
      </div>
    </div>
  )
}
