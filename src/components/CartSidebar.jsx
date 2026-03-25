import React, { useEffect } from 'react'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import styles from './CartSidebar.module.css'

export default function CartSidebar() {
  const { cartItems, cartOpen, setCartOpen, cartTotal, shipping, grandTotal,
          updateQuantity, removeFromCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Lock body scroll when cart is open
  useEffect(() => {
    if (cartOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflowY = 'scroll'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflowY = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflowY = ''
    }
  }, [cartOpen])

  const handleCheckout = () => {
    setCartOpen(false)
    if (!user) {
      navigate('/login?redirect=checkout')
    } else {
      navigate('/checkout')
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${cartOpen ? styles.open : ''}`}
        onClick={() => setCartOpen(false)}
      />

      {/* Panel */}
      <div className={`${styles.panel} ${cartOpen ? styles.open : ''}`}>
        <div className={styles.head}>
          <h2>Your Cart {cartItems.length > 0 && <span className={styles.count}>({cartItems.length})</span>}</h2>
          <button className={styles.closeBtn} onClick={() => setCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {cartItems.length === 0 ? (
            <div className={styles.empty}>
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Your cart is empty</p>
              <small>Browse our collections and add something beautiful!</small>
              <button className="btn-primary" style={{marginTop: '20px'}}
                onClick={() => { setCartOpen(false); navigate('/shop') }}>
                Shop Now
              </button>
            </div>
          ) : (
            <div className={styles.items}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.item}>
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className={styles.itemImg}
                  />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.product.name}</div>
                    {item.selectedSize && (
                      <div className={styles.itemVariant}>Size: {item.selectedSize}</div>
                    )}
                    {item.selectedColor && (
                      <div className={styles.itemVariant}>Color: {item.selectedColor}</div>
                    )}
                    <div className={styles.itemBottom}>
                      <div className={styles.qtyControls}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className={styles.itemPrice}>
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={shipping === 0 ? styles.free : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <div className={styles.freeShipNote}>
                  Add ₹{(799 - cartTotal).toLocaleString('en-IN')} more for free shipping
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
            <button
              className={styles.continueBtn}
              onClick={() => setCartOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
