import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, ChevronDown, ChevronUp,
  Clock, CheckCircle, Truck, XCircle,
  AlertTriangle, X, MapPin, CreditCard
} from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'
import styles from './Orders.module.css'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    icon: Clock,        color: '#856404', bg: '#fff3cd' },
  confirmed:  { label: 'Confirmed',  icon: CheckCircle,  color: '#0c63e4', bg: '#cfe2ff' },
  processing: { label: 'Processing', icon: Package,      color: '#0c63e4', bg: '#cfe2ff' },
  shipped:    { label: 'Shipped',    icon: Truck,        color: '#0a3622', bg: '#d1e7dd' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,  color: '#0a3622', bg: '#d1e7dd' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      color: '#842029', bg: '#f8d7da' },
}

const CANCELLABLE = ['pending', 'confirmed', 'processing']

export default function Orders() {
  const [orders, setOrders]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [expanded, setExpanded]         = useState({})
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

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please provide a reason'); return }
    setCancelling(true)
    try {
      await api.patch(`/orders/${cancelModal.id}/cancel`, { reason: cancelReason.trim() })
      setOrders(prev => prev.map(o =>
        o.id === cancelModal.id
          ? { ...o, status: 'cancelled', cancelReason: cancelReason.trim() }
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
            const statusKey = (order.status || '').toLowerCase()
            const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending
            const Icon = cfg.icon
            const canCancel = CANCELLABLE.includes(statusKey)
            const isExpanded = !!expanded[order.id]

            return (
              <div key={order.id} className={styles.card}>

                {/* ── TOP ROW ── */}
                <div className={styles.cardTop} onClick={() => toggleExpand(order.id)}>
                  <div>
                    <div className={styles.orderId}>Order #{order.id}</div>
                    <div className={styles.orderMeta}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : ''}
                    </div>
                  </div>
                  <div className={styles.cardTopRight}>
                    <span className={styles.statusBadge} style={{ color: cfg.color, background: cfg.bg }}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                    {isExpanded
                      ? <ChevronUp size={16} className={styles.chevron} />
                      : <ChevronDown size={16} className={styles.chevron} />}
                  </div>
                </div>

                {/* ── ITEMS PREVIEW (collapsed) ── */}
                {!isExpanded && (
                  <div className={styles.cardItems}>
                    {order.items?.slice(0, 2).map((item, i) => (
                      <div key={i} className={styles.itemRow}>
                        <img src={item.imageUrl} alt={item.name} className={styles.itemImg} />
                        <div className={styles.itemInfo}>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemMeta}>Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <div className={styles.moreItems}>+{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}</div>
                    )}
                  </div>
                )}

                {/* ── EXPANDED DETAILS ── */}
                {isExpanded && (
                  <div className={styles.detailsPanel}>

                    {/* All items */}
                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel}>Items Ordered</div>
                      {order.items?.map((item, i) => (
                        <div key={i} className={styles.itemRowFull}>
                          <img src={item.imageUrl} alt={item.name} className={styles.itemImgLg} />
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>{item.name}</div>
                            <div className={styles.itemMeta}>
                              Qty: {item.quantity}
                              {item.selectedSize && <> · Size: {item.selectedSize}</>}
                              {item.selectedColor && (
                                <span className={styles.colorDot} style={{ background: item.selectedColor }} />
                              )}
                            </div>
                            <div className={styles.itemPrice}>₹{item.price?.toLocaleString('en-IN')} each</div>
                          </div>
                          <div className={styles.itemTotal}>₹{item.totalPrice?.toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>

                    {/* Price breakdown */}
                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel}>Price Details</div>
                      <div className={styles.priceRow}><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
                      <div className={styles.priceRow}>
                        <span>Shipping</span>
                        <span>{order.shippingCharge === 0 || order.shippingCharge === '0.00' ? <span className={styles.freeTag}>FREE</span> : `₹${order.shippingCharge}`}</span>
                      </div>
                      <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                        <span>Total</span><span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Shipping address */}
                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel}><MapPin size={13}/> Delivery Address</div>
                      <div className={styles.addressBox}>
                        <div className={styles.addressName}>{order.shippingName}</div>
                        <div className={styles.addressText}>
                          {order.shippingAddress}, {order.shippingCity}, {order.shippingState} — {order.shippingPinCode}
                        </div>
                        <div className={styles.addressPhone}>{order.shippingPhone}</div>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel}><CreditCard size={13}/> Payment</div>
                      <div className={styles.payRow}>
                        <span className={styles.payMethod}>{order.paymentMethod}</span>
                        <span className={styles.payStatus} style={{
                          color: order.paymentStatus === 'paid' ? '#0a3622' : '#856404',
                          background: order.paymentStatus === 'paid' ? '#d1e7dd' : '#fff3cd',
                        }}>{order.paymentStatus}</span>
                      </div>
                    </div>

                    {/* Cancel reason if cancelled */}
                    {statusKey === 'cancelled' && order.cancelReason && (
                      <div className={styles.cancelledNote}>Reason: {order.cancelReason}</div>
                    )}

                    {/* Action buttons */}
                    <div className={styles.detailActions}>
                      {canCancel && (
                        <button
                          className={styles.cancelOrderBtn}
                          onClick={e => { e.stopPropagation(); setCancelModal(order); setCancelReason('') }}
                        >
                          <XCircle size={14} /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── FOOTER (total + collapse) ── */}
                <div className={styles.cardFooter} onClick={() => toggleExpand(order.id)}>
                  <div className={styles.orderTotal}>
                    Total: <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className={styles.viewDetails}>
                    {isExpanded ? 'Hide Details' : 'View Details'}
                    {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </div>
                </div>

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
