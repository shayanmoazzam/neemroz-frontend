import React, { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'
import styles from './TrackOrder.module.css'

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered']

const STATUS_INFO = {
  placed:    { icon: <Clock size={20}/>,       label: 'Order Placed',     desc: 'We have received your order' },
  confirmed: { icon: <CheckCircle size={20}/>, label: 'Order Confirmed',  desc: 'Your order has been confirmed' },
  packed:    { icon: <Package size={20}/>,     label: 'Order Packed',     desc: 'Your order is packed & ready' },
  shipped:   { icon: <Truck size={20}/>,       label: 'Out for Delivery', desc: 'Your order is on the way' },
  delivered: { icon: <MapPin size={20}/>,      label: 'Delivered',        desc: 'Order successfully delivered' },
}

// Fake order for demo
const DEMO_ORDER = {
  id: 'AYZ-1042',
  status: 'shipped',
  product: 'Crimson Floral Bedsheet',
  image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&q=80',
  customer: 'Rahul Verma',
  address: '42, Shivaji Nagar, Pune - 411005',
  dates: {
    placed:    'March 22, 2026 — 10:30 AM',
    confirmed: 'March 22, 2026 — 11:15 AM',
    packed:    'March 23, 2026 — 09:00 AM',
    shipped:   'March 24, 2026 — 08:45 AM',
    delivered: null,
  },
  tracking: 'DTDC123456789IN',
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder]     = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = (e) => {
    e.preventDefault()
    if (!orderId.trim()) return
    setLoading(true)
    setError('')
    // Simulate API call
    setTimeout(() => {
      if (orderId.trim().toUpperCase() === 'AYZ-1042') {
        setOrder(DEMO_ORDER)
      } else {
        setOrder(null)
        setError('No order found with this ID. Try "AYZ-1042" for a demo.')
      }
      setLoading(false)
    }, 1000)
  }

  const activeIndex = order ? STATUSES.indexOf(order.status) : -1

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="section-eyebrow">Order Tracking</div>
        <h1 className={styles.title}>Track Your <em>Order</em></h1>
        <p className={styles.sub}>Enter your Order ID to get real-time delivery updates</p>
      </div>

      {/* Search Form */}
      <form className={styles.form} onSubmit={handleTrack}>
        <div className={styles.inputWrap}>
          <Search size={17} className={styles.inputIcon} />
          <input
            className={styles.input}
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g. AYZ-1042)"
          />
        </div>
        <button type="submit" className={styles.trackBtn} disabled={loading}>
          {loading ? 'Tracking...' : 'Track Order'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {/* Result */}
      {order && (
        <div className={styles.result}>

          {/* Order Summary */}
          <div className={styles.orderCard}>
            <img src={order.image} alt={order.product} className={styles.orderImg} />
            <div className={styles.orderInfo}>
              <div className={styles.orderProduct}>{order.product}</div>
              <div className={styles.orderMeta}>Order ID: <strong>{order.id}</strong></div>
              <div className={styles.orderMeta}>Customer: {order.customer}</div>
              <div className={styles.orderMeta}>
                <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                {order.address}
              </div>
              {order.tracking && (
                <div className={styles.trackingNum}>
                  📦 Tracking: <strong>{order.tracking}</strong>
                </div>
              )}
            </div>
            <div className={`${styles.statusPill} ${styles[order.status]}`}>
              {STATUS_INFO[order.status]?.label}
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.timelineWrap}>
            <h2 className={styles.timelineTitle}>Delivery Progress</h2>
            <div className={styles.timeline}>
              {STATUSES.map((s, i) => {
                const done    = i <= activeIndex
                const current = i === activeIndex
                const info    = STATUS_INFO[s]
                return (
                  <div key={s} className={`${styles.step} ${done ? styles.done : ''} ${current ? styles.current : ''}`}>
                    <div className={styles.stepLeft}>
                      <div className={styles.stepIconWrap}>
                        {info.icon}
                      </div>
                      {i < STATUSES.length - 1 && (
                        <div className={`${styles.stepLine} ${done && i < activeIndex ? styles.stepLineDone : ''}`} />
                      )}
                    </div>
                    <div className={styles.stepBody}>
                      <div className={styles.stepLabel}>{info.label}</div>
                      <div className={styles.stepDesc}>{info.desc}</div>
                      {order.dates[s] && (
                        <div className={styles.stepDate}>{order.dates[s]}</div>
                      )}
                      {!order.dates[s] && done && (
                        <div className={styles.stepPending}>Pending...</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* Help */}
      <div className={styles.help}>
        <p>Can't find your order? <a href="/faqs">Check our FAQs</a> or <a href={`https://wa.me/919999999999?text=Hi, I need help tracking my order`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>.</p>
      </div>
    </div>
  )
}
