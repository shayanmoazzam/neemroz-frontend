import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Shield, Truck, RefreshCw, Leaf } from 'lucide-react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import styles from './Home.module.css'

const CATEGORIES = [
  { key: 'bedsheet', label: 'Bed Sheets',  desc: 'Premium Embroidered Collections',
    img: 'https://www.ayezu.com/images/products/new-21.jpg' },
  { key: 'kids',     label: 'Kids Wear',   desc: 'Kurtas, Gharara & More',
    img: 'https://www.ayezu.com/images/products/new-15.jpg' },
  { key: 'women',    label: 'Women Wear',  desc: 'Gharara, Suits & More',
    img: 'https://www.ayezu.com/images/products/new-18.jpg' },
]

const WHY = [
  { icon: <Leaf size={28}/>,      title: '100% Pure Cotton',   text: 'Every thread carefully sourced — breathable, soft, and skin-friendly for all seasons.' },
  { icon: <Star size={28}/>,      title: 'Premium Quality',    text: 'From bedsheets to clothing — every product crafted with care and attention to detail.' },
  { icon: <Truck size={28}/>,     title: 'Fast Delivery',      text: 'Free shipping above ₹799. Express delivery across India within 2–4 days.' },
  { icon: <RefreshCw size={28}/>, title: '30-Day Returns',     text: 'Not satisfied? Return within 30 days, no questions asked.' },
  { icon: <Shield size={28}/>,    title: 'Secure Payments',    text: 'Razorpay-powered 100% secure checkout. UPI, cards, and COD accepted.' },
]

const REVIEWS = [
  { name: 'Priya Sharma',  loc: 'Mumbai',    stars: 5, text: "Absolutely love the quality! The embroidery is stunning and the fabric is so soft. Will order again!" },
  { name: 'Rahul Verma',   loc: 'Pune',      stars: 5, text: "Ordered the crimson bed set and it transformed our bedroom completely. Delivery was super fast!" },
  { name: 'Anjali Mehta',  loc: 'Bangalore', stars: 4, text: "Ayezu Collection is my go-to for home linen. Great value and the designs are always fresh!" },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/products')
      .then(r => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const bedsheets = products.filter(p => p.category === 'bedsheet')
  const kidsWear  = products.filter(p => p.category === 'kids')
  const womenWear = products.filter(p => p.category === 'women')

  return (
    <div>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={`${styles.eyebrow} fade-up`}>Premium Collection Since 2020</div>
          <h1 className={`${styles.h1} fade-up-2`}>
            Style That Speaks,<br/><em>Quality That Lasts</em>
          </h1>
          <p className={`${styles.heroSub} fade-up-3`}>
            Discover our exclusive range of premium bedsheets, kids wear and women wear —
            crafted with love and delivered to your doorstep.
          </p>
          <div className={`${styles.heroBtns} fade-up-3`}>
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Shop Now
            </button>
            <button className="btn-outline" onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}>
              Explore Collections
            </button>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.imgGrid}>
            {[
              'https://www.ayezu.com/images/products/new-21.jpg',
              'https://www.ayezu.com/images/products/new-1.jpg',
              'https://www.ayezu.com/images/products/new-15.jpg',
              'https://www.ayezu.com/images/products/new-18.jpg',
            ].map((src, i) => (
              <div key={i} className={styles.imgCell}>
                <img src={src} alt="collection" loading="lazy" />
              </div>
            ))}
          </div>
          <div className={styles.heroBadge}>
            <strong>4.8 ★</strong>
            Trusted by 5,000+ families
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className={styles.stats}>
        {[
          ['5K+', 'Happy Customers'],
          ['500+', 'Products'],
          ['100%', 'Pure Cotton'],
          ['4.8★', 'Avg. Rating'],
        ].map(([num, label]) => (
          <div key={label} className={styles.stat}>
            <div className={styles.statNum}>{num}</div>
            <div className={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      <section className={styles.section} id="categories">
        <div className="section-head">
          <div className="section-eyebrow">Browse by Category</div>
          <h2 className="section-title">Our <em>Collections</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.catGrid}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.key}
              className={styles.catCard}
              onClick={() => navigate(`/shop?category=${cat.key}`)}
              style={{ cursor: 'pointer' }}
            >
              <img src={cat.img} alt={cat.label} loading="lazy" />
              <div className={styles.catOverlay} />
              <div className={styles.catInfo}>
                <div className={styles.catName}>{cat.label}</div>
                <div className={styles.catCount}>{cat.desc}</div>
                <button
                  className={styles.catBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/shop?category=${cat.key}`)
                  }}
                >
                  Shop Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BEDSHEETS ── */}
      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className="section-head">
          <div className="section-eyebrow">Home Living</div>
          <h2 className="section-title">Featured <em>Bed Sheets</em></h2>
          <div className="divider" />
        </div>
        {loading ? (
          <div className={styles.loader}>Loading products...</div>
        ) : (
          <div className={styles.productGrid}>
            {bedsheets.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-outline" onClick={() => navigate('/shop?category=bedsheet')}>
            View All Bed Sheets
          </button>
        </div>
      </section>

      {/* ── KIDS WEAR ── */}
      <section className={`${styles.section} ${styles.sectionSand}`}>
        <div className="section-head">
          <div className="section-eyebrow">Little Ones</div>
          <h2 className="section-title">Kids <em>Wear</em></h2>
          <div className="divider" />
        </div>
        {loading ? (
          <div className={styles.loader}>Loading products...</div>
        ) : (
          <div className={styles.productGrid}>
            {kidsWear.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-outline" onClick={() => navigate('/shop?category=kids')}>
            View All Kids Wear
          </button>
        </div>
      </section>

      {/* ── WOMEN WEAR ── */}
      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className="section-head">
          <div className="section-eyebrow">For Her</div>
          <h2 className="section-title">Women <em>Wear</em></h2>
          <div className="divider" />
        </div>
        {loading ? (
          <div className={styles.loader}>Loading products...</div>
        ) : (
          <div className={styles.productGrid}>
            {womenWear.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn-outline" onClick={() => navigate('/shop?category=women')}>
            View All Women Wear
          </button>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className={`${styles.section} ${styles.sectionSand}`}>
        <div className="section-head">
          <div className="section-eyebrow">Why Ayezu Collection</div>
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
              <div className={styles.reviewStars}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
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
