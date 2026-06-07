import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BarberCard from '../../components/public/BarberCard'
import ServiceCard from '../../components/public/ServiceCard'
import { fetchPublicShop } from '../../services/publicShopService'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ShopProfile(){
  const { slug } = useParams()
  const [shop, setShop] = useState(null)
  const [error, setError] = useState('')
  useEffect(()=>{ fetchPublicShop(slug).then(response=>setShop(response.shop)).catch(()=>setError('Shop not found.')) }, [slug])

  if (error) return <Message text={error} />
  if (!shop) return <Message text="Loading shop..." />

  return (
    <div>
      <div className="h-52 bg-gradient-to-br from-amber-100 to-stone-300 sm:h-72">{shop.cover_image_url && <img src={shop.cover_image_url} alt="" className="h-full w-full object-cover" />}</div>
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <section className="-mt-12 rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4"><Logo shop={shop} /><div><h1 className="text-2xl font-black">{shop.name}</h1><p className="text-sm text-stone-500">{shop.district || 'Aqaba'} - {shop.address || 'Address not added'}</p><span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-bold ${shop.is_open_now ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>{shop.is_open_now ? 'Open now' : 'Closed now'}</span></div></div>
            <Link to={`/shop/${shop.slug}/book`} className="rounded-xl bg-amber-500 px-5 py-3 text-center font-bold">Book Appointment</Link>
          </div>
          <p className="mt-5 text-stone-600">{shop.description || 'Book your next appointment at this Aqaba barber shop.'}</p>
          {shop.google_maps_url && <a href={shop.google_maps_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-bold text-amber-700">Open in Google Maps</a>}
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="space-y-3 lg:col-span-2"><h2 className="text-xl font-black">Barbers</h2>{shop.barbers.map(barber=><BarberCard key={barber.id} barber={barber} />)}{!shop.barbers.length && <Empty text="No active barbers listed." />}</section>
          <section><h2 className="text-xl font-black">Opening hours</h2><div className="mt-3 rounded-2xl border bg-white p-4">{shop.hours.map(hour=><div key={hour.id} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{days[hour.day_of_week]}</span><span>{hour.is_closed ? 'Closed' : `${hour.open_time.slice(0, 5)} - ${hour.close_time.slice(0, 5)}`}</span></div>)}</div></section>
        </div>
        <section className="mt-6"><h2 className="text-xl font-black">Services</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{shop.services.map(service=><ServiceCard key={service.id} service={service} />)}</div>{!shop.services.length && <Empty text="No active services listed." />}</section>
        {shop.products?.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xl font-black">Products</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shop.products.map(product => (
                <div key={product.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="h-44 w-full object-cover" />
                    : <div className="h-44 bg-stone-100 flex items-center justify-center text-stone-400 text-sm">No image</div>
                  }
                  <div className="p-4">
                    <div className="font-bold">{product.name}</div>
                    {product.description && <p className="text-sm text-gray-500 mt-1">{product.description}</p>}
                    <div className="mt-2 font-semibold text-amber-600">
                      {product.price ? `${product.price} JOD` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
function Logo({ shop }){ return shop.logo_url ? <img src={shop.logo_url} alt="" className="h-20 w-20 rounded-2xl border bg-white object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-900 text-2xl font-black text-white">{shop.name.slice(0, 1)}</div> }
function Empty({ text }){ return <div className="rounded-xl border border-dashed bg-white p-4 text-sm text-stone-500">{text}</div> }
function Message({ text }){ return <div className="mx-auto max-w-6xl px-4 py-14 text-stone-600">{text}</div> }
