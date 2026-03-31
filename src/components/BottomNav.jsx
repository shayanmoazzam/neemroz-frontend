import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import styles from './BottomNav.module.css'

// Close the left drawer (Navbar) and reset its body-overflow lock
const closeDrawer = () => {
  document.body.style.overflow = ''
  window.dispatchEvent(new CustomEvent('closeMobileMenu'))
}

export default function BottomNav() {
  const { cartCount, setCartOpen, cartOpen } = useCart()
  const { wishlist } = useWishlist()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Close cart sidebar and restore body scroll (position:fixed lock)
  const closeCart = () => {
    if (cartOpen) {
      // CartSidebar locks scroll via position:fixed — mirror its cleanup
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflowY = ''
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1)
      setCartOpen(false)
    }
  }

  const handleNav = (to) => {
    closeDrawer()
    closeCart()
    if (to === '/' && pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (to) {
      navigate(to)
    }
  }

  const handleCart = () => {
    closeDrawer()
    setCartOpen(true)
  }

  return (
    <nav className={styles.nav}>

      <button
        className={`${styles.item} ${pathname === '/' ? styles.active : ''}`}
        onClick={() => handleNav('/')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <NavLink
        to="/shop"
        onClick={() => handleNav(null)}
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <ShoppingBag size={22} />
        <span>Shop</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        onClick={() => handleNav(null)}
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <div className={styles.iconWrap}>
          <Heart size={22} />
          {wishlist.length > 0 && <span className={styles.badge}>{wishlist.length}</span>}
        </div>
        <span>Wishlist</span>
      </NavLink>

      <button className={styles.item} onClick={handleCart}>
        <div className={styles.iconWrap}>
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </div>
        <span>Cart</span>
      </button>

      <NavLink
        to={user ? '/orders' : '/login'}
        onClick={() => handleNav(null)}
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <User size={22} />
        <span>{user ? 'Account' : 'Login'}</span>
      </NavLink>

    </nav>
  )
}
