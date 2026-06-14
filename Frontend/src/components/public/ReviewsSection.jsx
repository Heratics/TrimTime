import React, { useEffect, useState } from 'react'
import { StarDisplay } from './StarRating'
import ReviewModal from '../ReviewModal'
import { fetchShopReviews } from '../../services/publicShopService'
import { useLanguage } from '../../context/LanguageContext'

function relativeTime(dateStr, t) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 2) return t('reviews_just_now')
  if (minutes < 60) return `${minutes} ${t('reviews_minutes_ago')}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${t('reviews_hours_ago')}`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? t('reviews_day_ago') : t('reviews_days_ago')}`
}

export default function ReviewsSection({ shopId, initialAvg = 0, initialCount = 0, onStatsChange }) {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState([])
  const [avg, setAvg] = useState(initialAvg)
  const [count, setCount] = useState(initialCount)
  const [showModal, setShowModal] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!shopId) return
    fetchShopReviews(shopId).then(data => {
      setReviews(data.reviews || [])
      setAvg(data.averageRating || 0)
      setCount(data.totalReviews || 0)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [shopId])

  function handleSuccess(newReview) {
    // Insert new review at top (keep at most 5)
    const updated = [
      {
        reviewId: newReview.reviewId,
        reviewerName: newReview.reviewerName,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.createdAt,
      },
      ...reviews,
    ].slice(0, 5)

    const newCount = count + 1
    const newAvg = Math.round(((avg * count) + newReview.rating) / newCount * 10) / 10

    setReviews(updated)
    setCount(newCount)
    setAvg(newAvg)
    setShowModal(false)

    if (onStatsChange) onStatsChange({ averageRating: newAvg, totalReviews: newCount })
  }

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black">{t('reviews_title')}</h2>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition"
        >
          {t('reviews_leave')}
        </button>
      </div>

      {/* Summary */}
      {count > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <StarDisplay rating={avg} size="md" />
          <span className="text-xl font-black">{avg.toFixed(1)}</span>
          <span className="text-stone-500 text-sm">{t('reviews_avg_out_of')}</span>
          <span className="text-stone-400 text-sm">· {count} {t('reviews_count')}</span>
        </div>
      )}

      {/* Review cards */}
      {loaded && reviews.length === 0 && (
        <div className="rounded-xl border border-dashed bg-white p-4 text-sm text-stone-500">
          {t('reviews_no_reviews')}
        </div>
      )}

      <div className="space-y-3">
        {reviews.map(review => (
          <ReviewCard key={review.reviewId} review={review} t={t} />
        ))}
      </div>

      {showModal && (
        <ReviewModal
          shopId={shopId}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </section>
  )
}

function ReviewCard({ review, t }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="mb-1">
            <StarDisplay rating={review.rating} size="sm" />
          </div>
          <div className="font-semibold text-stone-800">{review.reviewerName}</div>
          {review.comment && (
            <p className="mt-1 text-sm text-stone-600">{review.comment}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-stone-400">{relativeTime(review.createdAt, t)}</span>
      </div>
    </div>
  )
}
