import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Shield, Truck, RefreshCw, Leaf } from 'lucide-react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import styles from './Home.module.css'

const CATEGORIES = [
  { key: 'bedsheets', label: 'Bedsheets', count: '48 Products',
    img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80' },
  { key: 'pillow',    label: 'Pillow Covers', count: '36 Products',
    img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80' },
  { key: 'bedset',    label: 'Bed Sets', count: '24 Products',
    img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80' },
  { key: 'duvet',     label: 'Duvet Covers', count: '18 Products',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
]

const WHY = [
  { icon: <Leaf size={28}/>,      title: '100% Pure Cotton',  text: 'Every thread carefully sourced — breathable, soft, and skin-friendly for all seasons.' },
  { icon: <Star size={28}/>,      title: '200+ Designs',      text: 'From classic whites to vibrant prints — something for every bedroom aesthetic.' },
  { icon: <Truck size={28}/>,     title: 'Fast Delivery',     text: 'Free shipping above ₹799. Express delivery across India within 2–4 days.' },
  { icon: <RefreshCw size={28}/>, title: '30-Day Returns',    text: 'Not satisfied? Return within 30 days, no questions asked.' },
  { icon: <Shield size={28}/>,    title: 'Secure Payments',   text: 'Razorpay-powered 100% secure checkout. UPI, cards, and COD accepted.' },
]

const REVIEWS = [
  { name: 'Priya Sharma',    loc: 'Mumbai',    stars: 5, text: "Absolutely love the quality! The cotton is so soft and colours didn't fade after many washes." },
  { name: 'Rahul Verma',     loc: 'Pune',      stars: 5, text: "Ordered the complete bed set and it transformed our bedroom. Delivery was super fast!" },
  { name: 'Anjali Mehta',    loc: 'Bangalore', stars: 4, text: "Great value for money and the designs are always fresh. Neemroz is my go-to for home linen!" },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={`${styles.eyebrow} fade-up`}>Premium Home Linen Since 2018</div>
          <h1 className={`${styles.h1} fade-up-2`}>
            Where Every <em>Night</em><br/>Feels Like Luxury
          </h1>
          <p className={`${styles.heroSub} fade-up-3`}>
            Crafted from 100% pure cotton — our bedsheets and pillow covers bring
            softness, colour, and joy to your bedroom.
          </p>
          <div className={`${styles.heroBtns} fade-up-3`}>
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Shop Now
            </button>
            <button className="btn-outline" onClick={() => navigate('/shop')}>
              Explore Collections
            </button>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.imgGrid}>
            {[
              'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80',
              'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=500&q=80',
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80',
            ].map((src, i) => (
              <div key={i} className={styles.imgCell}>
                <img src={src} alt="bedroom" loading="lazy" />
              </div>
            ))}
          </div>
          <div className={styles.heroBadge}>
            <strong>4.8 ★</strong>
            Trusted by 12,000+ families
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className={styles.stats}>
        {[['12K+','Happy Customers'],['200+','Designs'],['100%','Pure Cotton'],['4.8★','Avg. Rating']].map(
          ([num, label]) => (
            <div key={label} className={styles.stat}>
              <div className={styles.statNum}>{num}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          )
        )}
      </div>

      {/* ── CATEGORIES ── */}
      <section className={styles.section}>
        <div className="section-head">
          <div className="section-eyebrow">Browse by Category</div>
          <h2 className="section-title">Find Your <em>Perfect</em> Collection</h2>
          <div className="divider" />
        </div>
        <div className={styles.catGrid}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.key}
              className={styles.catCard}
              onClick={() => navigate(`/shop?category=${cat.key}`)}
            >
              <img src={cat.img} alt={cat.label} loading="lazy" />
              <div className={styles.catOverlay} />
              <div className={styles.catInfo}>
                <div className={styles.catName}>{cat.label}</div>
                <div className={styles.catCount}>{cat.count}</div>
                <button className={styles.catBtn}>Shop Now →</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className="section-head">
          <div className="section-eyebrow">Our Collection</div>
          <h2 className="section-title">New <em>Arrivals</em></h2>
          <div className="divider" />
        </div>
        {loading ? (
          <div className={styles.loader}>Loading products...</div>
        ) : (
          <div className={styles.productGrid}>
            {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div style={{textAlign:'center', marginTop:'40px'}}>
          <button className="btn-outline" onClick={() => navigate('/shop')}>
            View All Products
          </button>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className={`${styles.section} ${styles.sectionSand}`}>
        <div className="section-head">
          <div className="section-eyebrow">Why Neemroz</div>
          <h2 className="section-title">Made with <em>Care</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.whyGrid}>
          {WHY.map(w => (
            <div key={w.title} className={styles.whyCard}>
              <div className={styles.whyIcon}>{w.icon}</div>
              <div className={styles.whyTitle}>{w.title}</div>
              <div className={styles.whyText}>{w.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className={styles.section}>
        <div className="section-head">
          <div className="section-eyebrow">Customer Love</div>
          <h2 className="section-title">What Customers <em>Say</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.reviewsGrid}>
          {REVIEWS.map(r => (
            <div key={r.name} className={styles.reviewCard}>
              <div className={styles.reviewStars}>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</div>
              <p className={styles.reviewText}>"{r.text}"</p>
              <div className={styles.reviewAuthor}>
                <div className={styles.reviewAvatar}>{r.name[0]}</div>
                <div>
                  <div className={styles.reviewName}>{r.name}</div>
                  <div className={styles.reviewLoc}>{r.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
