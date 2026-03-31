import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Smartphone, Truck, Copy, Check, MessageSquare } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import toast from 'react-hot-toast'
import styles from './Checkout.module.css'

const STORE_PHONE = '917001065007'
const UPI_ID      = '8677870128@ybl'
const UPI_NAME    = 'Ayezu Collection'

const STEPS = ['Delivery', 'Payment', 'Confirm']

const PAY_METHODS = [
  { key: 'UPI', label: 'UPI / QR Code',   icon: <Smartphone size={20}/> },
  { key: 'COD', label: 'Cash on Delivery', icon: <Truck size={20}/> },
]

export default function Checkout() {
  const { cartItems, cartTotal, shipping, grandTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate  = useNavigate()
  const pageTopRef = useRef(null)

  const [step, setStep]               = useState(0)
  const [payMethod, setPayMethod]     = useState('UPI')
  const [loading, setLoading]         = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [showUPI, setShowUPI]         = useState(false)
  const [copied, setCopied]           = useState(false)

  // Coupon state — backed by API
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [coupon, setCoupon]                 = useState('')
  const [couponApplied, setCouponApplied]   = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError]       = useState('')
  const [couponLoading, setCouponLoading]   = useState(false)

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    email:     user?.email     || '',
    phone:     '',
    address:   '',
    city:      'Pune',
    state:     'Maharashtra',
    pinCode:   '',
  })

  // Load active coupons from backend on mount
  useEffect(() => {
    api.get('/coupons/active').catch(() => api.get('/coupons'))
      .then(r => setAvailableCoupons(Array.isArray(r.data) ? r.data.filter(c => c.isActive) : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step, showUPI])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Validate coupon via backend API
  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase()
    if (!code) { setCouponError('Please enter a coupon code'); return }
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await api.post('/coupons/validate', {
        code,
        orderAmount: cartTotal,
      })
      const disc = res.data.discountAmount || 0
      setCouponDiscount(disc)
      setCouponApplied(true)
      setCouponError('')
      toast.success(`Coupon applied! ₹${disc} off 🎉`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code'
      setCouponError(msg)
      setCouponDiscount(0)
      setCouponApplied(false)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCoupon('')
    setCouponApplied(false)
    setCouponDiscount(0)
    setCouponError('')
  }

  const discountedTotal = cartTotal - couponDiscount
  const discountedShip  = discountedTotal >= 799 ? 0 : 79
  const finalTotal      = discountedTotal + discountedShip

  const validateStep0 = () => {
    const { firstName, lastName, phone, address, city, pinCode } = form
    if (!firstName || !lastName || !phone || !address || !city || !pinCode) {
      toast.error('Please fill all required fields')
      return false
    }
    if (!/^\d{10}$/.test(phone))  { toast.error('Enter a valid 10-digit phone number'); return false }
    if (!/^\d{6}$/.test(pinCode)) { toast.error('Enter a valid 6-digit PIN code'); return false }
    return true
  }

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return
    setStep(s => s + 1)
  }

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true)
      toast.success('UPI ID copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalTotal}&cu=INR`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`

  // ── STORE OWNER WhatsApp alert (UPI payment verification) ──
  // Uses itemsSnapshot so it works even after cart is cleared
  const sendOwnerWhatsApp = (order, items) => {
    const itemLines = items.map(i => `  • ${i.product.name} x${i.quantity} — ₹${(i.product.price * i.quantity).toLocaleString('en-IN')}`).join('\n')
    const msg = [
      `💸 *New UPI Payment — Ayezu Collection*`,
      ``,
      `📦 Order #${order.orderNumber || order.id}`,
      `👤 ${form.firstName} ${form.lastName}`,
      `📞 ${form.phone}`,
      `📍 ${form.address}, ${form.city}, ${form.state} - ${form.pinCode}`,
      ``,
      `*Items:*`,
      itemLines,
      ``,
      `💰 Total Paid: ₹${finalTotal.toLocaleString('en-IN')}`,
      `💳 UPI ID: ${UPI_ID}`,
      ``,
      `Please verify the payment and confirm the order.`,
    ].join('\n')
    window.open(`https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // ── CUSTOMER WhatsApp confirmation ──
  // FIXED: uses `items` parameter (snapshot), NOT cartItems from context
  const sendCustomerWhatsApp = (order, items) => {
    const phone = form.phone.trim()
    if (!phone || phone.length < 10) return

    const itemLines = items.map(i => `  • ${i.product.name} x${i.quantity} — ₹${(i.product.price * i.quantity).toLocaleString('en-IN')}`).join('\n')
    const msg = [
      `🛍️ *Order Confirmed — Ayezu Collection*`,
      ``,
      `Hi ${form.firstName}! 🎉 Your order has been placed successfully.`,
      ``,
      `📦 *Order ID:* #${order.orderNumber || order.id}`,
      `💳 *Payment:* ${payMethod === 'COD' ? 'Cash on Delivery' : 'UPI'}`,
      ``,
      `*Items Ordered:*`,
      itemLines,
      ``,
      `💰 *Total:* ₹${finalTotal.toLocaleString('en-IN')}`,
      couponDiscount > 0 ? `🎁 *Coupon Savings:* ₹${couponDiscount}` : null,
      ``,
      `📍 *Deliver to:*`,
      `${form.address}, ${form.city}, ${form.state} – ${form.pinCode}`,
      ``,
      `🚚 Expected delivery in *3–5 business days*.`,
      ``,
      `Thank you for shopping with Ayezu Collection! 💛`,
      `Track your order at: https://www.ayezu.com/orders`,
    ].filter(l => l !== null).join('\n')

    // Indian phone: prepend 91 if not already
    const waPhone = phone.startsWith('91') ? phone : `91${phone}`
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // ── CUSTOMER SMS confirmation (native sms: deeplink — works on mobile) ──
  // FIXED: uses `items` parameter (snapshot), NOT cartItems from context
  const sendCustomerSMS = (order, items) => {
    const phone = form.phone.trim()
    if (!phone || phone.length < 10) return

    const msg = [
      `Ayezu Collection: Order #${order.orderNumber || order.id} confirmed!`,
      `Items: ${items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}`,
      `Total: Rs.${finalTotal}`,
      `Payment: ${payMethod === 'COD' ? 'COD' : 'UPI'}`,
      `Delivery: ${form.address}, ${form.city} - ${form.pinCode}`,
      `Expected: 3-5 business days. Track: ayezu.com/orders`,
    ].join(' | ')

    // sms: deep link — opens native messaging app on mobile
    const smsLink = `sms:${phone}?body=${encodeURIComponent(msg)}`
    window.open(smsLink, '_blank')
  }

  // ── Notify backend to send SMS/email (server-side, if configured) ──
  const notifyBackend = async (order) => {
    try {
      await api.post(`/orders/${order.id}/notify`, {
        phone: form.phone,
        email: form.email,
        orderNumber: order.orderNumber || order.id,
      })
    } catch {
      // Silently ignore — backend notification is best-effort
    }
  }

  const handlePlaceOrder = async () => {
    if (payMethod === 'UPI') {
      setShowUPI(true)
      return
    }
    await submitOrder()
  }

  const handleIvePaid = async () => {
    await submitOrder()
  }

  const submitOrder = async () => {
    setLoading(true)
    // Snapshot cart items BEFORE clearCart() is called — used in all notifications
    const itemsSnapshot = [...cartItems]
    try {
      const orderRes = await api.post('/orders', {
        paymentMethod:   payMethod,
        shippingName:    `${form.firstName} ${form.lastName}`,
        shippingPhone:   form.phone,
        shippingAddress: form.address,
        shippingCity:    form.city,
        shippingState:   form.state,
        shippingPinCode: form.pinCode,
        couponCode:      couponApplied ? coupon.trim().toUpperCase() : null,
        couponDiscount,
      })
      const order = orderRes.data

      // Clear cart AFTER snapshot — order is confirmed
      clearCart()
      setPlacedOrder(order)

      // Send all notifications — all use itemsSnapshot, NOT cartItems
      if (payMethod === 'UPI') {
        sendOwnerWhatsApp(order, itemsSnapshot)       // alert store owner
      }
      sendCustomerWhatsApp(order, itemsSnapshot)      // ← Customer WhatsApp ✅
      sendCustomerSMS(order, itemsSnapshot)            // ← Customer SMS ✅
      notifyBackend(order)                             // ← Backend email (best-effort)

      setShowUPI(false)
      setStep(2)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0 && step < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--earth)', marginBottom: '20px' }}>Your cart is empty</p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Shop Now</button>
      </div>
    )
  }

  return (
    <div className={styles.page} ref={pageTopRef}>

      {/* PROGRESS BAR */}
      <div className={styles.progressBar}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`${styles.stepDot} ${i <= step ? styles.stepActive : ''}`}>
              {i < step ? <CheckCircle size={16} /> : i + 1}
            </div>
            <div className={`${styles.stepLabel} ${i <= step ? styles.stepLabelActive : ''}`}>{s}</div>
            {i < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${i < step ? styles.stepLineActive : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── UPI PAYMENT SCREEN ── */}
      {showUPI && step === 1 && (
        <div className={styles.upiScreen}>
          <div className={styles.upiCard}>
            <div className={styles.upiHeader}>
              <span className={styles.upiHeaderIcon}>💳</span>
              <div>
                <h2 className={styles.upiTitle}>Pay via UPI</h2>
                <p className={styles.upiSubtitle}>Scan QR or tap the button below</p>
              </div>
            </div>

            <div className={styles.upiAmount}>
              ₹{finalTotal.toLocaleString('en-IN')}
              <span className={styles.upiAmountLabel}>Total Amount</span>
            </div>

            <div className={styles.qrWrap}>
              <img
                src={qrUrl}
                alt="UPI QR Code"
                className={styles.qrImg}
                width={200}
                height={200}
              />
              <p className={styles.qrHint}>Scan with GPay, PhonePe, Paytm or any UPI app</p>
            </div>

            <div className={styles.upiIdRow}>
              <span className={styles.upiIdLabel}>UPI ID</span>
              <span className={styles.upiIdValue}>{UPI_ID}</span>
              <button className={styles.copyBtn} onClick={copyUPI}>
                {copied ? <Check size={14}/> : <Copy size={14}/>}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <a href={upiDeepLink} className={styles.upiAppBtn}>
              📲 Open UPI App to Pay
            </a>

            <p className={styles.upiNote}>
              ⚠️ After paying, tap <strong>"I've Paid"</strong> below to confirm your order.
              We'll verify and dispatch within 24 hours.
            </p>

            <div className={styles.upiActions}>
              <button
                className={styles.paidBtn}
                onClick={handleIvePaid}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : '✅ I\'ve Paid — Confirm Order'}
              </button>
              <button
                className={styles.backBtn}
                onClick={() => setShowUPI(false)}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NORMAL CHECKOUT FLOW ── */}
      {!showUPI && (
        <div className={styles.content}>
          <div className={styles.left}>

            {/* Step 0: Delivery */}
            {step === 0 && (
              <div className={styles.formBox}>
                <h2 className={styles.formTitle}>Delivery Details</h2>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>First Name *</label>
                    <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Shayan" />
                  </div>
                  <div className={styles.field}>
                    <label>Last Name *</label>
                    <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Khan" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Email Address</label>
                  <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" type="email" />
                </div>
                <div className={styles.field}>
                  <label>Phone Number *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" maxLength={10} inputMode="numeric" />
                </div>
                <div className={styles.field}>
                  <label>Address Line 1 *</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="House No / Street Name / Locality" />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>City *</label>
                    <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Pune" />
                  </div>
                  <div className={styles.field}>
                    <label>PIN Code *</label>
                    <input value={form.pinCode} onChange={e => set('pinCode', e.target.value)} placeholder="411001" maxLength={6} inputMode="numeric" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label>State</label>
                  <select value={form.state} onChange={e => set('state', e.target.value)}>
                    {['Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat','Rajasthan','West Bengal','Uttar Pradesh','Other'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className={styles.formBox}>
                <h2 className={styles.formTitle}>Payment Method</h2>
                <div className={styles.payMethods}>
                  {PAY_METHODS.map(m => (
                    <button
                      key={m.key}
                      className={`${styles.payMethod} ${payMethod === m.key ? styles.paySelected : ''}`}
                      onClick={() => setPayMethod(m.key)}
                    >
                      <span className={styles.payIcon}>{m.icon}</span>
                      <span className={styles.payLabel}>{m.label}</span>
                      {payMethod === m.key && <span className={styles.payCheck}>✓</span>}
                    </button>
                  ))}
                </div>

                <div className={styles.payNote}>
                  {payMethod === 'UPI' && <><Smartphone size={15}/> Scan QR code or open your UPI app to pay ₹{finalTotal.toLocaleString('en-IN')}. Confirm after payment.</>}
                  {payMethod === 'COD' && <><Truck size={15}/> Pay ₹{finalTotal.toLocaleString('en-IN')} when your order arrives.</>}
                </div>

                <div className={styles.deliverySummary}>
                  <div className={styles.deliverySummaryLabel}>📦 Delivering to</div>
                  <div className={styles.deliverySummaryName}>{form.firstName} {form.lastName} · {form.phone}</div>
                  <div className={styles.deliverySummaryAddr}>{form.address}, {form.city}, {form.state} – {form.pinCode}</div>
                </div>

                {/* Notification note */}
                <div className={styles.notifNote}>
                  <MessageSquare size={14} />
                  You'll receive a <strong>WhatsApp</strong> &amp; <strong>SMS</strong> confirmation on <strong>{form.phone}</strong> once your order is placed.
                </div>
              </div>
            )}

            {/* Step 2: Success */}
            {step === 2 && (
              <div className={styles.success}>
                <div className={styles.successIcon}>🎉</div>
                <h2>Order Placed!</h2>
                <p>Thank you for shopping with <strong>Ayezu Collection</strong>!</p>
                {payMethod === 'UPI' && (
                  <p style={{ color: '#166534', background: '#f0fdf4', padding: '10px 16px', borderRadius: '10px', margin: '12px 0', fontSize: '.88rem' }}>
                    💸 Payment received! We'll verify and dispatch within <strong>24 hours</strong>.
                  </p>
                )}
                <p>Your order will be delivered within <strong>3–5 business days</strong>.</p>
                {placedOrder && (
                  <div className={styles.orderId}>Order #{placedOrder.orderNumber || placedOrder.id}</div>
                )}

                {/* Confirmation sent notice */}
                <div className={styles.confirmSentBox}>
                  <div className={styles.confirmSentRow}>
                    <span className={styles.confirmSentIcon}>💬</span>
                    <span>WhatsApp confirmation sent to <strong>{form.phone}</strong></span>
                  </div>
                  <div className={styles.confirmSentRow}>
                    <span className={styles.confirmSentIcon}>📱</span>
                    <span>SMS confirmation sent to <strong>{form.phone}</strong></span>
                  </div>
                  {form.email && (
                    <div className={styles.confirmSentRow}>
                      <span className={styles.confirmSentIcon}>📧</span>
                      <span>Email confirmation sent to <strong>{form.email}</strong></span>
                    </div>
                  )}
                </div>

                <div className={styles.successBtns}>
                  <button className="btn-primary" onClick={() => navigate('/orders')}>View Orders</button>
                  <button className="btn-outline" onClick={() => navigate('/')}>Continue Shopping</button>
                </div>
              </div>
            )}

            {step < 2 && (
              <div className={styles.navBtns}>
                {step > 0 && (
                  <button className="btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
                )}
                {step < 1 ? (
                  <button className="btn-primary" onClick={handleNext}>Continue to Payment →</button>
                ) : (
                  <button className="btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? 'Placing Order...' : payMethod === 'COD' ? 'Place Order' : 'Pay Now →'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary */}
          {step < 2 && (
            <div className={styles.right}>
              <div className={styles.summary}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>
                <div className={styles.summaryItems}>
                  {cartItems.map(item => (
                    <div key={item.id} className={styles.summaryItem}>
                      <img src={item.product.imageUrl} alt={item.product.name} />
                      <div className={styles.summaryItemInfo}>
                        <span>{item.product.name}</span>
                        <small>Qty: {item.quantity}</small>
                      </div>
                      <span className={styles.summaryItemPrice}>
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.couponBox}>
                  <div className={styles.couponLabel}>🎁 Have a Coupon?</div>
                  {!couponApplied ? (
                    <div className={styles.couponRow}>
                      <input
                        className={styles.couponInput}
                        value={coupon}
                        onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError('') }}
                        placeholder="Enter coupon code"
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      />
                      <button type="button" className={styles.couponBtn} onClick={applyCoupon} disabled={couponLoading}>
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.couponSuccess}>
                      <span>✅ <strong>{coupon.toUpperCase()}</strong> — ₹{couponDiscount} off!</span>
                      <button type="button" className={styles.couponRemove} onClick={removeCoupon}>Remove</button>
                    </div>
                  )}
                  {couponError && <div className={styles.couponError}>{couponError}</div>}
                </div>

                <div className={styles.summaryCalc}>
                  <div className={styles.calcRow}><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                  {couponDiscount > 0 && (
                    <div className={styles.calcRow}>
                      <span>Coupon Discount</span>
                      <span className={styles.discountAmt}>− ₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className={styles.calcRow}>
                    <span>Shipping</span>
                    <span style={{ color: discountedShip === 0 ? '#2d8a4e' : 'inherit' }}>
                      {discountedShip === 0 ? 'FREE' : `₹${discountedShip}`}
                    </span>
                  </div>
                  <div className={`${styles.calcRow} ${styles.calcTotal}`}>
                    <span>Total</span><span>₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className={styles.trustBadges}>
                  <span>🔒 Secure</span>
                  <span>🚚 Fast Delivery</span>
                  <span>↩️ Easy Returns</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
