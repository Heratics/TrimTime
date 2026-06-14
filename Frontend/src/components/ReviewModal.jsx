import React, { useState, useEffect, useCallback } from 'react'
import { StarSelector } from './StarRating'
import { useLanguage } from '../../context/LanguageContext'
import { submitReview } from '../../services/publicShopService'

export default function ReviewModal({ shopId, onClose, onSuccess }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  async function handleSubmit() {
    setError('')
    if (!name.trim()) { setError(t('reviews_err_name')); return }
    if (!rating) { setError(t('reviews_err_rating')); return }

    setLoading(true)
    try {
      const review = await submitReview({ shopId, reviewerName: name, rating, comment })
      onSuccess(review)
    } catch {
      setError(t('reviews_err_submit'))
    } finally {
      setLoading(false)
    }
  }

  const ratingLabel = rating ? rating.toFixed(1) : '—'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <h2 className="text-xl font-black">{t('reviews_modal_title')}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition text-2xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Star Selector */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <StarSelector value={rating} onChange={setRating} />
            </div>
            <p className="text-2xl font-black text-amber-500">{ratingLabel}</p>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">{t('reviews_name_label')}</label>
            <input
              type="text"
              maxLength={100}
              placeholder={t('reviews_name_placeholder')}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-stone-700">{t('reviews_comment_label')}</label>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder={t('reviews_comment_placeholder')}
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition"
          >
            {t('reviews_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60 transition"
          >
            {loading ? t('reviews_submitting') : t('reviews_submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
