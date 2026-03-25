import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, CreditCard, Smartphone, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import toast from 'react-hot-toast'
import styles from './Checkout.module.css'

const STEPS = ['Delivery', 'Payment', 'Confirm']

const PAY_METHODS = [
  { key: 'UPI',  label: 'UPI',              icon: <Smartphone size={20}/> },
  { key: 'CARD', label: 'Card',             icon: <CreditCard size={20}/> },
  { key: 'COD',  label: 'Cash on Delivery', icon: <Truck size={20}/> },
]

const COUPONS = {
  'AYEZU10':   10,
  'WELCOME20': 20,
  'FESTIVE15': 15,
}

export default function Checkout() {
  const { cartItems, cartTotal, shipping, grandTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const pageTopRef = useRef(null)

  const [step, setStep]               = useState(0)
  const [payMethod, setPayMethod]     = useState('UPI')
  const [loading, setLoading]         = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  const [coupon, setCoupon]                 = useState('')
  const [couponApplied, setCouponApplied]   = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError]       = useState('')

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

  // ✅ Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    if (COUPONS[code]) {
      const disc = Math.round((cartTotal * COUPONS[code]) / 100)
      setCouponDiscount(disc)
      setCouponApplied(true)
      setCouponError('')
      toast.success(`Coupon applied! ₹${disc} off 🎉`)
    } else {
      setCouponError('Invalid coupon code')
      setCouponDiscount(0)
      setCouponApplied(false)
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

  const initiateRazorpay = (orderId, razorpayOrderId, amount) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: amount * 100,
      currency: 'INR',
      name: 'Ayezu Collection',
      description: 'Premium Home Linen',
      order_id: razorpayOrderId,
      handler: async (response) => {
        try {
          await api.post('/payment/verify', {
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
          setStep(2)
          clearCart()
        } catch {
          toast.error('Payment verification failed. Contact support.')
        }
      },
      prefill: {
        name:    `${form.firstName} ${form.lastName}`,
        email:   form.email,
        contact: form.phone,
      },
      theme: { color: '#3D2B1F' },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
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
      setPlacedOrder(order)

      if (payMethod === 'COD') {
        setStep(2)
        clearCart()
      } else {
        const payRes = await api.post('/payment/create', { orderId: order.id })
        initiateRazorpay(order.id, payRes.data.razorpayOrderId, payRes.data.amount)
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0 && step < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--earth)', marginBottom: '20px' }}>
          Your cart is empty
        </p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>
          Shop Now
        </button>
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

      <div className={styles.content}>

        {/* LEFT: Form */}
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
                {payMethod === 'UPI'  && <><Smartphone size={15}/> Redirected to Razorpay secure UPI screen.</>}
                {payMethod === 'CARD' && <><CreditCard size={15}/> Redirected to Razorpay secure card screen.</>}
                {payMethod === 'COD'  && <><Truck size={15}/> Pay ₹{finalTotal.toLocaleString('en-IN')} when your order arrives.</>}
              </div>

              <div className={styles.deliverySummary}>
                <div className={styles.deliverySummaryLabel}>📦 Delivering to</div>
                <div className={styles.deliverySummaryName}>{form.firstName} {form.lastName} · {form.phone}</div>
                <div className={styles.deliverySummaryAddr}>{form.address}, {form.city}, {form.state} – {form.pinCode}</div>
              </div>
            </div>
          )}

          {/* Step 2: Success */}
          {step === 2 && (
            <div className={styles.success}>
              <div className={styles.successIcon}>🎉</div>
              <h2>Order Placed!</h2>
              <p>Thank you for shopping with <strong>Ayezu Collection</strong>!</p>
              <p>Your order will be delivered within <strong>3–5 business days</strong>.</p>
              {placedOrder && (
                <div className={styles.orderId}>Order #{placedOrder.orderNumber}</div>
              )}
              <p className={styles.successNote}>
                Confirmation will be sent to <strong>{form.email}</strong>
              </p>
              <div className={styles.successBtns}>
                <button className="btn-primary" onClick={() => navigate('/orders')}>View Orders</button>
                <button className="btn-outline" onClick={() => navigate('/')}>Continue Shopping</button>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
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
                      onChange={e => { setCoupon(e.target.value); setCouponError('') }}
                      placeholder="Enter coupon code"
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    />
                    <button type="button" className={styles.couponBtn} onClick={applyCoupon}>Apply</button>
                  </div>
                ) : (
                  <div className={styles.couponSuccess}>
                    <span>✅ <strong>{coupon.toUpperCase()}</strong> — ₹{couponDiscount} off!</span>
                    <button type="button" className={styles.couponRemove} onClick={removeCoupon}>Remove</button>
                  </div>
                )}
                {couponError && <div className={styles.couponError}>{couponError}</div>}
                <div className={styles.couponHint}>Try: AYEZU10 · WELCOME20 · FESTIVE15</div>
              </div>

              <div className={styles.summaryCalc}>
                <div className={styles.calcRow}>
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
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
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
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
    </div>
  )
}
