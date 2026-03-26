import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, AlertTriangle, X } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'
import styles from './Orders.module.css'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: Clock,        color: '#856404', bg: '#fff3cd' },
  processing: { label: 'Processing', icon: Package,      color: '#0c63e4', bg: '#cfe2ff' },
  confirmed:  { label: 'Confirmed',  icon: CheckCircle,  color: '#0c63e4', bg: '#cfe2ff' },
  shipped:    { label: 'Shipped',    icon: Truck,        color: '#0a3622', bg: '#d1e7dd' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,  color: '#0a3622', bg: '#d1e7dd' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      color: '#842029', bg: '#f8d7da' },
}

const CANCELLABLE = ['pending', 'confirmed', 'processing']

export default function Orders() {
  const [orders, setOrders]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [cancelModal, setCancelModal]   = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling]     = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/orders')
      .then(r => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please provide a reason'); return }
    setCancelling(true)
    try {
      await api.patch(`/orders/${cancelModal.id}/cancel`, { reason: cancelReason.trim() })
      setOrders(prev => prev.map(o =>
        o.id === cancelModal.id
          ? { ...o, status: 'CANCELLED', cancelReason: cancelReason.trim() }
          : o
      ))
      toast.success('Order cancelled successfully')
      setCancelModal(null)
      setCancelReason('')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

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
            // Normalize status to lowercase for consistent comparison
            const statusKey = (order.status || '').toLowerCase()
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending
            const Icon = cfg.icon
            const canCancel = CANCELLABLE.includes(statusKey)

            return (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardTop} onClick={() => navigate(`/track-order?id=${order.id}`)}>
                  <div className={styles.orderId}>Order #{order.id}</div>
                  <span className={styles.statusBadge} style={{ color: cfg.color, background: cfg.bg }}>
                    <Icon size={12} /> {cfg.label}
                  </span>
                </div>

                <div className={styles.cardItems} onClick={() => navigate(`/track-order?id=${order.id}`)}>
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
                  <div
                    onClick={() => navigate(`/track-order?id=${order.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, cursor: 'pointer' }}
                  >
                    <div className={styles.orderTotal}>Total: <strong>₹{(order.totalAmount ?? order.total)?.toLocaleString('en-IN')}</strong></div>
                    <div className={styles.orderDate}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </div>
                    <ChevronRight size={16} className={styles.chevron} />
                  </div>

                  {canCancel && (
                    <button
                      className={styles.cancelOrderBtn}
                      onClick={e => { e.stopPropagation(); setCancelModal(order); setCancelReason('') }}
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  )}
                </div>

                {statusKey === 'cancelled' && order.cancelReason && (
                  <div className={styles.cancelledNote}>
                    Reason: {order.cancelReason}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── CANCEL MODAL ── */}
      {cancelModal && (
        <div className={styles.modalOverlay} onClick={() => setCancelModal(null)}>
          <div className={styles.cancelModalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.cancelModalHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={22} color="#e53e3e" />
                <h3>Cancel Order #{cancelModal.id}?</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setCancelModal(null)}><X size={18}/></button>
            </div>
            <p className={styles.cancelModalSub}>Please tell us why you want to cancel this order.</p>
            <div className={styles.reasonList}>
              {['Changed my mind', 'Found a better price', 'Ordered by mistake', 'Delivery taking too long', 'Other'].map(r => (
                <button
                  key={r}
                  className={`${styles.reasonBtn} ${cancelReason === r ? styles.reasonActive : ''}`}
                  onClick={() => setCancelReason(r)}
                >{r}</button>
              ))}
            </div>
            <textarea
              className={styles.reasonInput}
              placeholder="Add more details (optional)"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={2}
            />
            <div className={styles.cancelModalFoot}>
              <button className={styles.keepBtn} onClick={() => setCancelModal(null)}>Keep Order</button>
              <button className={styles.confirmCancelBtn} onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : <><XCircle size={15}/> Confirm Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
