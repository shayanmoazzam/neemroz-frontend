import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Shield, Truck, RefreshCw, Leaf, ArrowRight } from 'lucide-react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import HeroCarousel from '../components/HeroCarousel'
import styles from './Home.module.css'

const CATEGORIES = [
  { key: 'bedsheet', label: 'Bed Sheets',  desc: 'Premium Embroidered Collections', emoji: '🛏️',
    img: 'https://www.ayezu.com/images/products/new-21.jpg' },
  { key: 'kids',     label: 'Kids Wear',   desc: 'Kurtas, Gharara & More', emoji: '👗',
    img: 'https://www.ayezu.com/images/products/new-15.jpg' },
  { key: 'women',    label: 'Women Wear',  desc: 'Gharara, Suits & More', emoji: '✨',
    img: 'https://www.ayezu.com/images/products/new-18.jpg' },
]

const WHY = [
  { icon: <Leaf size={26}/>,      title: '100% Pure Cotton',   text: 'Breathable, soft and skin-friendly for all seasons.' },
  { icon: <Star size={26}/>,      title: 'Premium Quality',    text: 'Crafted with care and attention to every detail.' },
  { icon: <Truck size={26}/>,     title: 'Fast Delivery',      text: 'Free shipping above ₹799. Delivered in 2–4 days.' },
  { icon: <RefreshCw size={26}/>, title: '7-Day Returns',      text: 'Easy hassle-free returns, no questions asked.' },
  { icon: <Shield size={26}/>,    title: 'Secure Payments',    text: 'Razorpay-powered. UPI, cards and COD accepted.' },
]

const REVIEWS = [
  { name: 'Priya Sharma',  loc: 'Mumbai',    stars: 5, text: 'Absolutely love the quality! The embroidery is stunning and the fabric is so soft. Will definitely order again!' },
  { name: 'Rahul Verma',   loc: 'Pune',      stars: 5, text: 'Ordered the crimson bed set and it completely transformed our bedroom. Delivery was super fast too!' },
  { name: 'Anjali Mehta',  loc: 'Bangalore', stars: 5, text: 'Ayezu Collection is my go-to for home linen. Great value and the designs are always fresh and elegant!' },
  { name: 'Fatima Sheikh', loc: 'Hyderabad', stars: 5, text: 'The kids wear is absolutely gorgeous. My daughter loved her outfit for Eid. Premium quality at great price!' },
  { name: 'Deepika Nair',  loc: 'Chennai',   stars: 4, text: 'Beautiful bedsheets. The embroidery work is so detailed and intricate. Very happy with my purchase!' },
  { name: 'Arjun Kapoor',  loc: 'Delhi',     stars: 5, text: 'Packaging was excellent and product quality exceeded expectations. Highly recommend Ayezu Collection!' },
]

const MARQUEE_ITEMS = [
  '🚚 Free Shipping above ₹799',
  '✨ Premium 300TC Cotton',
  '⭐ 4.8 Star Rated',
  '🎁 Exclusive New Arrivals',
  '🔒 100% Secure Payments',
  '🔄 Easy 7-Day Returns',
  '🏆 Trusted by 5000+ Families',
  '💎 Handcrafted Embroidery',
]

export default function Home() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [visible, setVisible]     = useState({})
  const navigate    = useNavigate()
  const sectionRefs = useRef({})

  // Review auto-slide
  useEffect(() => {
    const t = setInterval(() => setReviewIdx(i => (i + 1) % Math.ceil(REVIEWS.length / 3)), 4000)
    return () => clearInterval(t)
  }, [])

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.reveal]: true }))
      }),
      { threshold: 0.12 }
    )
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [loading])

  const ref = (key) => el => { sectionRefs.current[key] = el }

  useEffect(() => {
    api.get('/products')
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const bedsheets = products.filter(p => p.category === 'bedsheet')
  const kidsWear  = products.filter(p => p.category === 'kids')
  const womenWear = products.filter(p => p.category === 'women')
  const reviewPage = REVIEWS.slice(reviewIdx * 3, reviewIdx * 3 + 3)

  return (
    <div className={styles.page}>

      {/* ── HERO CAROUSEL (replaces old hero) ── */}
      <HeroCarousel />

      {/* ── MARQUEE ── */}
      <div className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className={styles.marqueeItem}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className={styles.stats} data-reveal="stats" ref={ref('stats')}>
        {[
          ['5K+',  'Happy Customers', '👨‍👩‍👧'],
          ['500+', 'Products',         '🛍️'],
          ['100%', 'Pure Cotton',      '🌿'],
          ['4.8★', 'Avg. Rating',      '⭐'],
        ].map(([num, label, emoji]) => (
          <div key={label} className={`${styles.stat} ${visible.stats ? styles.statVisible : ''}`}>
            <div className={styles.statEmoji}>{emoji}</div>
            <div className={styles.statNum}>{num}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      <section className={styles.section} id="categories"
        data-reveal="cats" ref={ref('cats')}
      >
        <div className="section-head">
          <div className="section-eyebrow">Browse by Category</div>
          <h2 className="section-title">Our <em>Collections</em></h2>
          <div className="divider" />
        </div>
        <div className={`${styles.catGrid} ${visible.cats ? styles.revealed : ''}`}>
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.key}
              className={styles.catCard}
              style={{ animationDelay: `${i * 0.12}s` }}
              onClick={() => navigate(`/shop?category=${cat.key}`)}
            >
              <img src={cat.img} alt={cat.label} loading="lazy" />
              <div className={styles.catOverlay} />
              <div className={styles.catInfo}>
                <div className={styles.catEmoji}>{cat.emoji}</div>
                <div className={styles.catName}>{cat.label}</div>
                <div className={styles.catCount}>{cat.desc}</div>
                <button
                  className={styles.catBtn}
                  onClick={e => { e.stopPropagation(); navigate(`/shop?category=${cat.key}`) }}
                >
                  Shop Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BEDSHEETS ── */}
      <section className={`${styles.section} ${styles.sectionWhite}`}
        data-reveal="beds" ref={ref('beds')}
      >
        <div className="section-head">
          <div className="section-eyebrow">Home Living</div>
          <h2 className="section-title">Featured <em>Bed Sheets</em></h2>
          <div className="divider" />
        </div>
        {loading
          ? <div className={styles.shimmerGrid}>{[...Array(4)].map((_,i) => <div key={i} className={styles.shimmerCard}/>)}</div>
          : (
            <div className={`${styles.productGrid} ${visible.beds ? styles.revealed : ''}`}>
              {bedsheets.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        }
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-outline" onClick={() => navigate('/shop?category=bedsheet')}>
            View All Bed Sheets &nbsp;<ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── OFFER BANNER ── */}
      <div className={styles.offerBanner}>
        <div className={styles.offerContent}>
          <div className={styles.offerLeft}>
            <div className={styles.offerTag}>LIMITED TIME</div>
            <h3>Get <span>FREE Shipping</span> on orders above ₹799</h3>
            <p>Use code <strong>AYEZU10</strong> at checkout for extra 10% off</p>
          </div>
          <button className={styles.offerBtn} onClick={() => navigate('/shop')}>
            Grab the Deal →
          </button>
        </div>
      </div>

      {/* ── KIDS WEAR ── */}
      <section className={`${styles.section} ${styles.sectionSand}`}
        data-reveal="kids" ref={ref('kids')}
      >
        <div className="section-head">
          <div className="section-eyebrow">Little Ones</div>
          <h2 className="section-title">Kids <em>Wear</em></h2>
          <div className="divider" />
        </div>
        {loading
          ? <div className={styles.shimmerGrid}>{[...Array(4)].map((_,i) => <div key={i} className={styles.shimmerCard}/>)}</div>
          : (
            <div className={`${styles.productGrid} ${visible.kids ? styles.revealed : ''}`}>
              {kidsWear.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        }
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-outline" onClick={() => navigate('/shop?category=kids')}>
            View All Kids Wear &nbsp;<ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── WOMEN WEAR ── */}
      <section className={`${styles.section} ${styles.sectionWhite}`}
        data-reveal="women" ref={ref('women')}
      >
        <div className="section-head">
          <div className="section-eyebrow">For Her</div>
          <h2 className="section-title">Women <em>Wear</em></h2>
          <div className="divider" />
        </div>
        {loading
          ? <div className={styles.shimmerGrid}>{[...Array(4)].map((_,i) => <div key={i} className={styles.shimmerCard}/>)}</div>
          : (
            <div className={`${styles.productGrid} ${visible.women ? styles.revealed : ''}`}>
              {womenWear.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        }
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-outline" onClick={() => navigate('/shop?category=women')}>
            View All Women Wear &nbsp;<ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className={`${styles.section} ${styles.sectionDeep}`}
        data-reveal="why" ref={ref('why')}
      >
        <div className="section-head">
          <div className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Why Ayezu Collection</div>
          <h2 className="section-title" style={{ color: 'var(--cream)' }}>Made with <em>Care</em></h2>
          <div className="divider" />
        </div>
        <div className={`${styles.whyGrid} ${visible.why ? styles.revealed : ''}`}>
          {WHY.map((w, i) => (
            <div key={w.title} className={styles.whyCard} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.whyIconWrap}>{w.icon}</div>
              <div className={styles.whyTitle}>{w.title}</div>
              <div className={styles.whyText}>{w.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className={`${styles.section} ${styles.sectionSand}`}
        data-reveal="reviews" ref={ref('reviews')}
      >
        <div className="section-head">
          <div className="section-eyebrow">Customer Love</div>
          <h2 className="section-title">What Customers <em>Say</em></h2>
          <div className="divider" />
        </div>
        <div className={`${styles.reviewsGrid} ${visible.reviews ? styles.revealed : ''}`}>
          {reviewPage.map(r => (
            <div key={r.name} className={styles.reviewCard}>
              <div className={styles.reviewStars}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
              <p className={styles.reviewText}>"{r.text}"</p>
              <div className={styles.reviewAuthor}>
                <div className={styles.reviewAvatar}>{r.name[0]}</div>
                <div>
                  <div className={styles.reviewName}>{r.name}</div>
                  <div className={styles.reviewLoc}>📍 {r.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.reviewDots}>
          {[...Array(Math.ceil(REVIEWS.length / 3))].map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${reviewIdx === i ? styles.dotActive : ''}`}
              onClick={() => setReviewIdx(i)}
            />
          ))}
        </div>
      </section>

    </div>
  )
}
