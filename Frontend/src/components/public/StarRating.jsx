import React, { useState, useRef, useCallback } from 'react'

// Display-only star rating
export function StarDisplay({ rating, size = 'sm' }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    const fill = Math.min(1, Math.max(0, rating - (i - 1)))
    stars.push(<StarSvg key={i} fill={fill} size={size} />)
  }
  return <span className="inline-flex gap-0.5">{stars}</span>
}

function StarSvg({ fill, size }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  const id = `grad-${Math.random().toString(36).slice(2)}`
  return (
    <svg className={sizeClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
          <stop offset={`${fill * 100}%`} stopColor="#d6d3d1" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  )
}

// Interactive star rating selector with half-star support + drag
export function StarSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  const getRatingFromX = useCallback((clientX) => {
    if (!containerRef.current) return 0
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    const raw = pct * 5
    return Math.round(raw * 2) / 2 // round to nearest 0.5
  }, [])

  const handleMouseMove = useCallback((e) => {
    const rating = getRatingFromX(e.clientX)
    setHovered(rating === 0 ? 0.5 : rating)
  }, [getRatingFromX])

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) setHovered(null)
  }, [isDragging])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    const rating = getRatingFromX(e.clientX)
    onChange(rating === 0 ? 0.5 : rating)
  }, [getRatingFromX, onChange])

  const handleMouseUp = useCallback((e) => {
    if (isDragging) {
      const rating = getRatingFromX(e.clientX)
      onChange(rating === 0 ? 0.5 : rating)
      setIsDragging(false)
    }
  }, [isDragging, getRatingFromX, onChange])

  const handleGlobalMouseMove = useCallback((e) => {
    if (isDragging) {
      const rating = getRatingFromX(e.clientX)
      setHovered(rating === 0 ? 0.5 : rating)
      onChange(rating === 0 ? 0.5 : rating)
    }
  }, [isDragging, getRatingFromX, onChange])

  const handleGlobalMouseUp = useCallback(() => {
    setIsDragging(false)
    setHovered(null)
  }, [])

  // Touch support
  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rating = getRatingFromX(touch.clientX)
    const v = rating === 0 ? 0.5 : rating
    setHovered(v)
    onChange(v)
  }, [getRatingFromX, onChange])

  const handleTouchEnd = useCallback((e) => {
    const touch = e.changedTouches[0]
    const rating = getRatingFromX(touch.clientX)
    onChange(rating === 0 ? 0.5 : rating)
    setHovered(null)
  }, [getRatingFromX, onChange])

  const displayed = hovered !== null ? hovered : (value || 0)

  return (
    <div
      ref={containerRef}
      className="flex cursor-pointer select-none touch-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // Global listeners for drag outside bounds
      onMouseEnter={() => {
        document.addEventListener('mousemove', handleGlobalMouseMove)
        document.addEventListener('mouseup', handleGlobalMouseUp)
      }}
      onMouseOut={() => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }}
      style={{ gap: '2px' }}
    >
      {[1, 2, 3, 4, 5].map(i => {
        const fill = Math.min(1, Math.max(0, displayed - (i - 1)))
        return (
          <svg key={i} className="w-9 h-9 transition-transform duration-75" style={{ transform: fill > 0 && fill < 1 ? 'scale(1.08)' : fill === 1 ? 'scale(1.12)' : 'scale(1)' }} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`sel-${i}`}>
                <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
                <stop offset={`${fill * 100}%`} stopColor="#d6d3d1" />
              </linearGradient>
            </defs>
            <path fill={`url(#sel-${i})`} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )
      })}
    </div>
  )
}
