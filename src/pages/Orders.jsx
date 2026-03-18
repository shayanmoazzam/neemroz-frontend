import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Orders.module.css'

const STATUS_COLOR = {
  PENDING:    '#E8A838',
  CONFIRMED:  '#3B82F6',
  PROCESSING: '#8B5CF6',
  SHIPPED:    '#F97316',
  DELIVERED:  '#2E7D52',
  CANCELLED:  '#EF4444',
  RETURNED:   '#6B7280',
}

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className={styles.loading}>Loading your orders...</div>

  if (orders.length === 0) return (
    <div className={styles.empty}>
      <Package size={52} strokeWidth={1} />
      <h2>No orders yet</h2>
      <p>Start shopping and your orders will appear here.</p>
      <button className="btn-primary" onClick={() => navigate('/shop')}>Shop Now</button>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Orders</h1>
        <p>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
      </div>

      <div className={styles.list}>
        {orders.map(order => (
          <div key={order.id} className={styles.card}>
            <div className={styles.cardHead} onClick={() => setExpanded(e => e === order.id ? null : order.id)}>
              <div className={styles.cardLeft}>
                <div className={styles.orderNum}>#{order.orderNumber}</div>
                <div className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                </div>
              </div>
              <div className={styles.cardRight}>
                <span
                  className={styles.statusBadge}
                  style={{ background: STATUS_COLOR[order.status] + '22', color: STATUS_COLOR[order.status] }}
                >
                  {order.status}
                </span>
                <span className={styles.orderTotal}>
                  ₹{order.totalAmount?.toLocaleString('en-IN')}
                </span>
                {expanded === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expanded === order.id && (
              <div className={styles.cardBody}>
                {order.items?.map(item => (
                  <div key={item.id} className={styles.orderItem}>
                    <img src={item.product?.imageUrl} alt={item.product?.name} />
                    <div className={styles.orderItemInfo}>
                      <div className={styles.orderItemName}>{item.product?.name}</div>
                      {item.selectedSize && <small>Size: {item.selectedSize}</small>}
                      <small>Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</small>
                    </div>
                    <div className={styles.orderItemTotal}>
                      ₹{item.totalPrice?.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}

                <div className={styles.orderDetails}>
                  <div className={styles.detailRow}>
                    <span>Shipping to</span>
                    <span>{order.shippingName} · {order.shippingCity}, {order.shippingState}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Payment</span>
                    <span>{order.paymentMethod} — <strong style={{ color: order.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--earth)' }}>{order.paymentStatus}</strong></span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Shipping charge</span>
                    <span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
                  </div>
                  <div className={`${styles.detailRow} ${styles.detailTotal}`}>
                    <span>Order Total</span>
                    <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
