import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import styles from './Footer.module.css'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.includes('@')) { toast.error('Enter a valid email'); return }
    toast.success('Welcome to the Neemroz family! 🌿')
    setEmail('')
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.newsletter}>
        <div className={styles.nlContent}>
          <div className={styles.nlText}>
            <div className={styles.nlEye}>Stay Connected</div>
            <h3>Get Exclusive Offers & New Arrivals</h3>
            <p>Join 8,000+ happy subscribers. First to know about new collections and flash sales.</p>
          </div>
          <form className={styles.nlForm} onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.nlInput}
            />
            <button type="submit" className={styles.nlBtn}>Subscribe</button>
          </form>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.brand}>
          <div className={styles.logo}>Neem<span>roz</span></div>
          <p>Premium home linen crafted from 100% pure cotton. Making every bedroom a place of comfort and beauty since 2018.</p>
          <div className={styles.socials}>
            <a href="#" className={styles.social}>f</a>
            <a href="#" className={styles.social}>in</a>
            <a href="#" className={styles.social}>ig</a>
            <a href="#" className={styles.social}>yt</a>
          </div>
        </div>

        <div className={styles.col}>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/shop?category=bedsheets">Bedsheets</Link></li>
            <li><Link to="/shop?category=pillow">Pillow Covers</Link></li>
            <li><Link to="/shop?category=bedset">Bed Sets</Link></li>
            <li><Link to="/shop?category=duvet">Duvet Covers</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Help</h4>
          <ul>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Returns & Refunds</a></li>
            <li><a href="#">Size Guide</a></li>
            <li><a href="#">Track Order</a></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Contact</h4>
          <ul>
            <li><a href="#">📍 Pune, Maharashtra</a></li>
            <li><a href="tel:+919876543210">📞 +91 98765 43210</a></li>
            <li><a href="mailto:hello@neemroz.in">✉️ hello@neemroz.in</a></li>
            <li><a href="#">⏰ Mon–Sat, 9am–6pm</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© 2025 Neemroz. All rights reserved.</span>
        <div className={styles.legal}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </footer>
  )
}
