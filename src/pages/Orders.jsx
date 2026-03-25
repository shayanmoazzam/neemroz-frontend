import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import api from '../api'
import styles from './Orders.module.css'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: Clock,        color: '#856404', bg: '#fff3cd' },
  processing: { label: 'Processing', icon: Package,      color: '#0c63e4', bg: '#cfe2ff' },
  shipped:    { label: 'Shipped',    icon: Truck,        color: '#0a3622', bg: '#d1e7dd' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,  color: '#0a3622', bg: '#d1e7dd' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      color: '#842029', bg: '#f8d7da' },
}

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.skeletonList}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonLine} style={{ width: '40%' }} />
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
            <div className={styles.skeletonLine} style={{ width: '30%' }} />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>My Orders</h1>
        <p className={styles.pageSubtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.empty}>
          <Package size={56} strokeWidth={1} />
          <p>No orders yet</p>
          <button className={styles.shopBtn} onClick={() => navigate('/shop')}>Start Shopping</button>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const Icon = cfg.icon
            return (
              <div key={order.id} className={styles.card} onClick={() => navigate(`/track-order?id=${order.id}`)}>
                <div className={styles.cardTop}>
                  <div className={styles.orderId}>Order #{order.id}</div>
                  <span
                    className={styles.statusBadge}
                    style={{ color: cfg.color, background: cfg.bg }}
                  >
                    <Icon size={12} /> {cfg.label}
                  </span>
                </div>

                <div className={styles.cardItems}>
                  {order.items?.slice(0, 2).map((item, i) => (
                    <div key={i} className={styles.itemRow}>
                      <img
                        src={item.imageUrl || item.product?.imageUrl}
                        alt={item.name || item.product?.name}
                        className={styles.itemImg}
                      />
                      <div className={styles.itemInfo}>
                        <div className={styles.itemName}>{item.name || item.product?.name}</div>
                        <div className={styles.itemMeta}>Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <div className={styles.moreItems}>+{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}</div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.orderTotal}>Total: <strong>₹{order.total?.toLocaleString('en-IN')}</strong></div>
                  <div className={styles.orderDate}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</div>
                  <ChevronRight size={16} className={styles.chevron} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
