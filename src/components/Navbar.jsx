import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount, setCartOpen } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [dropOpen, setDropOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQ.trim())}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  const handleLogout = () => {
    logout()
    setDropOpen(false)
    navigate('/')
  }

  return (
    <>
      <div className={styles.topbar}>
        🚚 Free shipping above ₹799 &nbsp;|&nbsp; 100% Pure Cotton &nbsp;|&nbsp; 30-Day Returns
      </div>

      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>Neem<span>roz</span></Link>

        <ul className={styles.links}>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/shop?category=bedsheets">Bedsheets</Link></li>
          <li><Link to="/shop?category=pillow">Pillows</Link></li>
          <li><Link to="/shop?category=bedset">Bed Sets</Link></li>
          <li><Link to="/shop?category=duvet">Duvets</Link></li>
        </ul>

        <div className={styles.actions}>
          {/* Search */}
          <button className={styles.iconBtn} onClick={() => setSearchOpen(s => !s)}>
            <Search size={19} />
          </button>

          {/* Auth */}
          {user ? (
            <div className={styles.userDrop}>
              <button className={styles.iconBtn} onClick={() => setDropOpen(d => !d)}>
                <User size={19} />
              </button>
              {dropOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropHeader}>
                    <span>{user.firstName} {user.lastName}</span>
                    <small>{user.email}</small>
                  </div>
                  <Link to="/orders" className={styles.dropItem} onClick={() => setDropOpen(false)}>
                    My Orders
                  </Link>
                  <button className={styles.dropItem} onClick={handleLogout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.iconBtn}>
              <User size={19} />
            </Link>
          )}

          {/* Cart */}
          <button className={styles.cartBtn} onClick={() => setCartOpen(true)}>
            <ShoppingCart size={17} />
            Cart
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>

          {/* Mobile menu */}
          <button className={styles.menuBtn} onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Search bar */}
      {searchOpen && (
        <div className={styles.searchBar}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              autoFocus
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search bedsheets, pillow covers, duvet..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchSubmit}>Search</button>
            <button type="button" onClick={() => setSearchOpen(false)} className={styles.searchClose}>
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>All Products</Link>
          <Link to="/shop?category=bedsheets" onClick={() => setMenuOpen(false)}>Bedsheets</Link>
          <Link to="/shop?category=pillow" onClick={() => setMenuOpen(false)}>Pillow Covers</Link>
          <Link to="/shop?category=bedset" onClick={() => setMenuOpen(false)}>Bed Sets</Link>
          <Link to="/shop?category=duvet" onClick={() => setMenuOpen(false)}>Duvet Covers</Link>
          {user ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login / Register</Link>
          )}
        </div>
      )}
    </>
  )
}
