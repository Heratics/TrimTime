import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ShopCard from '../../components/public/ShopCard'
import { fetchPublicShops } from '../../services/publicShopService'

export default function Home(){
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [shops, setShops] = useState([])

  useEffect(()=>{ fetchPublicShops().then(response=>setShops(response.shops || [])).catch(()=>{}) },[])
  const featured = shops.filter(shop=>shop.is_featured).slice(0, 3)
  const visibleFeatured = featured.length ? featured : shops.slice(0, 3)

  function submit(event){
    event.preventDefault()
    navigate(`/shops${search ? `?search=${encodeURIComponent(search)}` : ''}`)
  }

  return (
    <div>
      <section className="bg-stone-900 px-4 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">TrimTime Aqaba</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Find and book barber appointments in Aqaba.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-stone-300">Discover local barber shops, compare services, and reserve your time in a few taps.</p>
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row">
            <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search shops or barbers" className="min-w-0 flex-1 rounded-xl px-4 py-3 text-stone-900 outline-none" />
            <button className="rounded-xl bg-amber-500 px-5 py-3 font-bold text-stone-950">Search</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-amber-700">Discover</p><h2 className="text-2xl font-black">Featured shops</h2></div><Link to="/shops" className="text-sm font-bold text-amber-700">View all shops</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleFeatured.map(shop=><ShopCard key={shop.id} shop={shop} />)}</div>
        {!visibleFeatured.length && <div className="rounded-2xl border border-dashed bg-white p-5 text-sm text-stone-500">Featured shops will appear here as Aqaba shops are added.</div>}
      </section>

      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-6xl"><h2 className="text-center text-2xl font-black">How TrimTime works</h2><div className="mt-8 grid gap-4 sm:grid-cols-3"><Step number="1" title="Find a shop" text="Search barber shops and barbers across Aqaba." /><Step number="2" title="Pick your time" text="Choose a service and an available appointment slot." /><Step number="3" title="Book instantly" text="Enter your details and confirm your appointment." /></div></div>
      </section>

      <section className="px-4 py-14"><div className="mx-auto max-w-4xl rounded-3xl bg-amber-400 p-8 text-center sm:p-12"><h2 className="text-3xl font-black">Ready for your next cut?</h2><Link to="/shops" className="mt-5 inline-block rounded-full bg-stone-900 px-6 py-3 font-bold text-white">Find a barber</Link></div></section>
    </div>
  )
}

function Step({ number, title, text }){ return <div className="rounded-2xl border border-stone-200 p-5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-black">{number}</div><h3 className="mt-4 font-bold">{title}</h3><p className="mt-1 text-sm text-stone-600">{text}</p></div> }
