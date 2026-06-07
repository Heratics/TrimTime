import React, { useEffect, useState } from 'react'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../services/ownerService'
import ImageUpload from '../../components/ImageUpload'

export default function Products() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await fetchProducts()
      setProducts(res.products || [])
    } catch {
      setError('Unable to load products.')
    }
  }

  async function save(data) {
    try {
      if (editing) {
        await updateProduct(editing.id, data)
        setEditing(null)
      } else {
        await createProduct(data)
        setShowForm(false)
      }
      await load()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save product.')
    }
  }

  async function remove(product) {
    if (!confirm(`Delete "${product.name}"?`)) return
    try {
      await deleteProduct(product.id)
      await load()
    } catch {
      setError('Failed to delete product.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Showcase products available at your shop.</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setEditing(null) }}
          className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {(showForm || editing) && (
        <ProductForm
          initial={editing}
          onSave={save}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <div key={product.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            {product.image_url
              ? <img src={product.image_url} alt={product.name} className="h-44 w-full object-cover" />
              : <div className="h-44 w-full bg-stone-100 flex items-center justify-center text-stone-400 text-sm">No image</div>
            }
            <div className="p-4">
              <div className="font-bold">{product.name}</div>
              {product.description && <p className="text-sm text-gray-500 mt-1">{product.description}</p>}
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold text-amber-600">
                  {product.price ? `${product.price} JOD` : 'Price not set'}
                </span>
                {product.stock_quantity > 0 && (
                  <span className="text-xs text-green-600 font-medium">{product.stock_quantity} in stock</span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { setEditing(product); setShowForm(false) }}
                  className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(product)}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && !showForm && (
          <div className="col-span-3 rounded-xl border border-dashed bg-white p-8 text-center text-sm text-gray-500">
            No products added yet. Click "+ Add Product" to get started.
          </div>
        )}
      </div>
    </div>
  )
}

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    price: initial?.price || '',
    image_url: initial?.image_url || '',
    stock_quantity: initial?.stock_quantity || 0
  })

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  function submit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="font-semibold mb-4">{initial ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={submit} className="space-y-4">
        <ImageUpload
          label="Product Image"
          value={form.image_url}
          onChange={v => update('image_url', v)}
        />
        <Field label="Product Name *">
          <input value={form.name} onChange={e => update('name', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" required />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} className="w-full rounded-lg border px-3 py-2.5" placeholder="Short description..." />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (JOD)">
            <input type="number" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" placeholder="0.00" />
          </Field>
          <Field label="Stock Quantity">
            <input type="number" value={form.stock_quantity} onChange={e => update('stock_quantity', e.target.value)} className="w-full rounded-lg border px-3 py-2.5" placeholder="0" />
          </Field>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-stone-900 px-5 py-2.5 font-semibold text-white">
            {initial ? 'Save Changes' : 'Add Product'}
          </button>
          <button type="button" onClick={onCancel} className="rounded-xl border px-5 py-2.5 text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}