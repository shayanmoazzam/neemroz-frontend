import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import styles from './BottomNav.module.css'

export default function BottomNav() {
  const { cartCount, setCartOpen } = useCart()
  const { wishlist } = useWishlist()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleHome = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  return (
    <nav className={styles.nav}>

      <button
        className={`${styles.item} ${pathname === '/' ? styles.active : ''}`}
        onClick={handleHome}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <NavLink to="/shop" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <ShoppingBag size={22} />
        <span>Shop</span>
      </NavLink>

      <NavLink to="/wishlist" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <div className={styles.iconWrap}>
          <Heart size={22} />
          {wishlist.length > 0 && <span className={styles.badge}>{wishlist.length}</span>}
        </div>
        <span>Wishlist</span>
      </NavLink>

      <button
        className={styles.item}
        onClick={() => setCartOpen(true)}
      >
        <div className={styles.iconWrap}>
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </div>
        <span>Cart</span>
      </button>

      <NavLink
        to={user ? '/orders' : '/login'}
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <User size={22} />
        <span>{user ? 'Account' : 'Login'}</span>
      </NavLink>

    </nav>
  )
}
