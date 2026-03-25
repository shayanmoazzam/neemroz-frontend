import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './HeroCarousel.module.css'

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1400&q=80',
    eyebrow: 'New Arrivals 2026',
    title: 'Luxurious Bed Sheets',
    subtitle: 'Transform your bedroom with our premium cotton collection',
    cta: 'Shop Bed Sheets',
    link: '/shop?category=bedsheet',
    align: 'left',
    dark: false,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    eyebrow: 'Festive Collection',
    title: 'Kids Ethnic Wear',
    subtitle: 'Adorable outfits for your little ones — crafted with love',
    cta: 'Shop Kids Wear',
    link: '/shop?category=kids',
    align: 'center',
    dark: true,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&q=80',
    eyebrow: 'Premium Fabrics',
    title: 'Elegant Women Wear',
    subtitle: 'Grace and tradition woven into every thread',
    cta: 'Explore Collection',
    link: '/shop?category=women',
    align: 'right',
    dark: false,
  },
]

export default function HeroCarousel() {
  const [active, setActive]       = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef                  = useRef(null)
  const navigate                  = useNavigate()

  const go = (index) => {
    if (animating || index === active) return
    setAnimating(true)
    setActive(index)
    setTimeout(() => setAnimating(false), 700)
  }

  const prev = () => go((active - 1 + SLIDES.length) % SLIDES.length)
  const next = () => go((active + 1) % SLIDES.length)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [])

  const resetTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % SLIDES.length)
    }, 5000)
  }

  const handleNav = (dir) => {
    dir === 'prev' ? prev() : next()
    resetTimer()
  }

  return (
    <div className={styles.hero}>

      {/* ── SLIDES (background images only) ── */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`${styles.slide} ${i === active ? styles.slideActive : ''}`}
          style={{ backgroundImage: `url(${s.image})` }}
        />
      ))}

      {/* ── OVERLAY ── */}
      <div className={`${styles.overlay} ${SLIDES[active].dark ? styles.overlayDark : ''}`} />

      {/* ── CONTENT — only active slide shown ── */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`
            ${styles.content}
            ${styles[`align_${s.align}`]}
            ${i === active ? styles.contentActive : styles.contentHidden}
          `}
        >
          <div className={styles.eyebrow}>{s.eyebrow}</div>
          <h1 className={styles.title}>{s.title}</h1>
          <p className={styles.subtitle}>{s.subtitle}</p>
          <div className={styles.ctaRow}>
            <button className={styles.ctaBtn} onClick={() => navigate(s.link)}>
              {s.cta}
            </button>
            <button className={styles.ctaOutline} onClick={() => navigate('/shop')}>
              View All
            </button>
          </div>
        </div>
      ))}

      {/* ── ARROWS ── */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => handleNav('prev')}>
        <ChevronLeft size={24} />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => handleNav('next')}>
        <ChevronRight size={24} />
      </button>

      {/* ── DOTS ── */}
      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
            onClick={() => { go(i); resetTimer() }}
          />
        ))}
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className={styles.progress} key={active}>
        <div className={styles.progressBar} />
      </div>
    </div>
  )
}
