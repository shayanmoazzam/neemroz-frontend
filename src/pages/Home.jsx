import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Shield, Truck, RefreshCw, Leaf } from 'lucide-react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import styles from './Home.module.css'

const CATEGORIES = [
  { key: 'bedsheet',  label: 'Bedsheet',   desc: 'Premium Embroidered Collections',
    img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80' },
  { key: 'women',     label: 'Women Wear', desc: 'Kurtas, Suits & More',
    img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80' },
  { key: 'men',       label: 'Men Wear',   desc: 'Shirts, Trousers & More',
    img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80' },
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
    api.get('/products').then(r => setProducts(Array.isArray(r.data) ? r.data : [])).catch(() => setProducts([])).finally(() => setLoading(false))
  }, [])

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
            Discover our exclusive range of premium bedsheets, women wear and men wear —
            crafted with love and delivered to your doorstep.
          </p>
          <div className={`${styles.heroBtns} fade-up-3`}>
            <button className="btn-primary" onClick={() => navigate('/shop')}>
              Shop Now
            </button>
            <button className="btn-outline" onClick={() => document.getElementById('categories').scrollIntoView({behavior:'smooth'})}>
              Explore Collections
            </button>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.imgGrid}>
            {[
              'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80',
              'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=500&q=80',
              'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=500&q=80',
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80',
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
        {[['5K+','Happy Customers'],['500+','Products'],['100%','Pure Cotton'],['4.8★','Avg. Rating']].map(
          ([num, label]) => (
            <div key={label} className={styles.stat}>
              <div className={styles.statNum}>{num}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          )
        )}
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
            >
              <img src={cat.img} alt={cat.label} loading="lazy" />
              <div className={styles.catOverlay} />
              <div className={styles.catInfo}>
                <div className={styles.catName}>{cat.label}</div>
                <div className={styles.catCount}>{cat.desc}</div>
                <button className={styles.catBtn}>Shop Now →</button>
              </div>
              {cat.key === 'women' || cat.key === 'men' ? (
                <div className={styles.comingSoon}>Coming Soon</div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className="section-head">
          <div className="section-eyebrow">Home Living</div>
          <h2 className="section-title">Featured <em>Bedsheets</em></h2>
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

      {/* ── WOMEN WEAR COMING SOON ── */}
      <section className={`${styles.section} ${styles.sectionSand}`}>
        <div className="section-head">
          <div className="section-eyebrow">Coming Soon</div>
          <h2 className="section-title">Women <em>Wear</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.comingSoonBanner}>
          <div className={styles.comingSoonIcon}>👗</div>
          <h3>New Collection Dropping Soon!</h3>
          <p>Our exclusive women wear collection is being curated. Subscribe to get notified when it launches.</p>
          <div className={styles.notifyForm}>
            <input type="email" placeholder="Enter your email to get notified" className={styles.notifyInput}/>
            <button className="btn-primary">Notify Me</button>
          </div>
        </div>
      </section>

      {/* ── MEN WEAR COMING SOON ── */}
      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className="section-head">
          <div className="section-eyebrow">Coming Soon</div>
          <h2 className="section-title">Men <em>Wear</em></h2>
          <div className="divider" />
        </div>
        <div className={styles.comingSoonBanner}>
          <div className={styles.comingSoonIcon}>👔</div>
          <h3>New Collection Dropping Soon!</h3>
          <p>Our exclusive men wear collection is being curated. Subscribe to get notified when it launches.</p>
          <div className={styles.notifyForm}>
            <input type="email" placeholder="Enter your email to get notified" className={styles.notifyInput}/>
            <button className="btn-primary">Notify Me</button>
          </div>
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
