import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './InfoPage.module.css'

export default function TrackOrder() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [orderId, setOrderId] = useState('')

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Track Your Order</h1>
        <p>Stay updated on your delivery status</p>
      </div>
      <div className={styles.container}>
        <div className={styles.trackBox}>
          <div className={styles.trackIcon}>📦</div>
          <h2>Where is my order?</h2>
          <p>Enter your Order ID below or login to view all your orders.</p>
          <div className={styles.trackForm}>
            <input
              type="text"
              placeholder="e.g. NR20250325XXXX"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className={styles.trackInput}
            />
            <button className="btn-primary" onClick={() => navigate('/orders')}>
              Track Order
            </button>
          </div>
          {!user && (
            <p className={styles.trackNote}>
              Already have an account?{' '}
              <span className={styles.trackLink} onClick={() => navigate('/login')}>
                Login to view all orders →
              </span>
            </p>
          )}
          {user && (
            <button className="btn-outline" style={{ marginTop: '16px' }} onClick={() => navigate('/orders')}>
              View My Orders
            </button>
          )}
        </div>

        <div className={styles.section}>
          <h2>Order Status Guide</h2>
          <div className={styles.statusGrid}>
            <div className={styles.statusCard}><span>🕐</span><strong>Pending</strong><p>Order placed, awaiting confirmation</p></div>
            <div className={styles.statusCard}><span>✅</span><strong>Confirmed</strong><p>Payment received, being packed</p></div>
            <div className={styles.statusCard}><span>📦</span><strong>Shipped</strong><p>Out for delivery via courier</p></div>
            <div className={styles.statusCard}><span>🎉</span><strong>Delivered</strong><p>Successfully delivered to you</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
