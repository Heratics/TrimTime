import React, { useEffect, useRef, useState } from 'react'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function OwnerProducts() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await api.get('/owner/products')
      setProducts(res.data.products || [])
    } catch {
      setError(t('products_err_load'))
    }
  }

  function emptyForm() {
    return { name: '', description: '', price: '', stock_quantity: '', imageFile: null }
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm())
    setShowForm(true)
    setError('')
  }

  function openEdit(product) {
    setEditing(product)
    setForm({ name: product.name, description: product.description || '', price: product.price || '', stock_quantity: product.stock_quantity || '', imageFile: null })
    setShowForm(true)
    setError('')
  }

  async function save() {
    if (!form.name.trim()) return setError(t('products_name') + ' required')
    setSubmitting(true)
    try {
      const data = new FormData()
      data.append('name', form.name)
      data.append('description', form.description)
      data.append('price', form.price)
      data.append('stock_quantity', form.stock_quantity)
      if (form.imageFile) data.append('product_image', form.imageFile)
      if (editing) {
        await api.put(`/owner/products/${editing.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/owner/products', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setShowForm(false)
      load()
    } catch {
      setError(t('products_err_save'))
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return
    try {
      await api.delete(`/owner/products/${product.id}`)
      load()
    } catch {
      setError(t('products_err_delete'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{t('products_title')}</h1>
          <p className="text-sm text-stone-500">{t('products_sub')}</p>
        </div>
        {!showForm && (
          <button onClick={openAdd} className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">
            {t('products_add')}
          </button>
        )}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-black text-lg">{editing ? t('products_form_edit_title') : t('products_form_add_title')}</h2>
          <div>
            <p className="text-sm font-medium text-stone-700 mb-1">{t('products_image')}</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => setForm({ ...form, imageFile: e.target.files[0] })} className="text-sm" />
          </div>
          <label className="block text-sm font-medium text-stone-700">
            {t('products_name')}
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t('products_desc')}
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={t('products_desc_placeholder')}
              rows={3}
              className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              {t('products_price')}
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              {t('products_stock')}
              <input
                type="number"
                value={form.stock_quantity}
                onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={submitting} className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {editing ? t('products_save') : t('products_save_new')}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border px-5 py-2.5 text-sm font-bold">
              {t('products_cancel')}
            </button>
          </div>
        </div>
      )}

      {!products.length && !showForm && (
        <div className="rounded-2xl border border-dashed bg-white p-6 text-sm text-stone-500 text-center">
          {t('products_empty')}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <div key={product.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            {product.image_url
              ? <img src={product.image_url} alt={product.name} className="h-44 w-full object-cover" />
              : <div className="h-44 bg-stone-100 flex items-center justify-center text-stone-400 text-sm">{t('products_no_image')}</div>
            }
            <div className="p-4">
              <p className="font-bold">{product.name}</p>
              {product.description && <p className="text-sm text-stone-500 mt-1">{product.description}</p>}
              <p className="mt-2 font-semibold text-amber-600">
                {product.price ? `${product.price} JOD` : t('products_price_unset')}
              </p>
              {product.stock_quantity != null && (
                <p className="text-xs text-stone-400">{product.stock_quantity} {t('products_in_stock')}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(product)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-stone-50">
                  {t('products_edit')}
                </button>
                <button onClick={() => remove(product)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                  {t('products_delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}