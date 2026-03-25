import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, User, Search, Menu, X,
  LogOut, Heart, ChevronRight, Home,
  Package, HelpCircle, Truck, RotateCcw, MapPin
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import api from '../api'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout }           = useAuth()
  const { cartCount, setCartOpen } = useCart()
  const { wishlist }               = useWishlist()
  const navigate                   = useNavigate()

  const [menuOpen, setMenuOpen]       = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQ, setSearchQ]         = useState('')
  const [results, setResults]         = useState([])
  const [searching, setSearching]     = useState(false)
  const [dropOpen, setDropOpen]       = useState(false)
  const searchRef                     = useRef(null)
  const debounceRef                   = useRef(null)

  // Live search
  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); return }
    clearTimeout(debounceRef.current)
    setSearching(true)
    debounceRef.current = setTimeout(() => {
      api.get(`/products?search=${encodeURIComponent(searchQ.trim())}`)
        .then(r => setResults(Array.isArray(r.data) ? r.data.slice(0, 6) : []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 300)
  }, [searchQ])

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setResults([])
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQ.trim()) return
    navigate(`/shop?search=${encodeURIComponent(searchQ.trim())}`)
    setSearchOpen(false); setSearchQ(''); setResults([])
  }

  const handleResultClick = (id) => {
    navigate(`/product/${id}`)
    setSearchOpen(false); setSearchQ(''); setResults([])
  }

  const handleLogout = () => {
    logout(); setDropOpen(false); setMenuOpen(false); navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className={styles.topbar}>
        🚚 Free shipping above ₹799 &nbsp;|&nbsp; Premium Quality &nbsp;|&nbsp; 7-Day Returns
      </div>

      <nav className={styles.nav}>

        {/* LEFT: Hamburger (mobile) + Logo */}
        <div className={styles.navLeft}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className={styles.logo}>Ayezu <span>Collection</span></Link>
        </div>

        {/* CENTER: Desktop nav links */}
        <ul className={styles.links}>
          <li><Link to="/shop?category=bedsheet">Bed Sheets</Link></li>
          <li><Link to="/shop?category=kids">Kids Wear</Link></li>
          <li><Link to="/shop?category=women">Women Wear</Link></li>
          <li><Link to="/shop">All Products</Link></li>
        </ul>

        {/* RIGHT: Icons + Cart */}
        <div className={styles.actions}>

          {/* Search */}
          <button
            className={styles.iconBtn}
            onClick={() => { setSearchOpen(s => !s); setSearchQ(''); setResults([]) }}
            title="Search"
          >
            <Search size={19} />
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className={styles.iconBtnLink} title="Wishlist">
            <Heart size={19} />
            {wishlist.length > 0 && <span className={styles.wishBadge}>{wishlist.length}</span>}
          </Link>

          {/* User dropdown (desktop only) */}
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
                  <Link to="/orders"   className={styles.dropItem} onClick={() => setDropOpen(false)}>📦 My Orders</Link>
                  <Link to="/wishlist" className={styles.dropItem} onClick={() => setDropOpen(false)}>❤️ Wishlist ({wishlist.length})</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className={styles.dropItem} onClick={() => setDropOpen(false)}>⚙️ Admin Panel</Link>
                  )}
                  <button className={styles.dropItem} onClick={handleLogout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.iconBtn} title="Login">
              <User size={19} />
            </Link>
          )}

          {/* Cart */}
          <button className={styles.cartBtn} onClick={() => setCartOpen(true)}>
            <ShoppingCart size={17} />
            <span className={styles.cartLabel}>Cart</span>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* ── SEARCH BAR ── */}
      {searchOpen && (
        <div className={styles.searchBar} ref={searchRef}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input
                autoFocus
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search bedsheets, kids wear, women wear..."
                className={styles.searchInput}
              />
              {searchQ && (
                <button type="button" className={styles.clearBtn}
                  onClick={() => { setSearchQ(''); setResults([]) }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className={styles.searchSubmit}>Search</button>
            <button type="button"
              onClick={() => { setSearchOpen(false); setSearchQ(''); setResults([]) }}
              className={styles.searchClose}>
              <X size={18} />
            </button>
          </form>

          {(results.length > 0 || searching) && (
            <div className={styles.searchResults}>
              {searching && <div className={styles.searchLoading}>Searching...</div>}
              {!searching && results.map(p => (
                <div key={p.id} className={styles.searchResult} onClick={() => handleResultClick(p.id)}>
                  <img src={p.imageUrl} alt={p.name} className={styles.resultImg} />
                  <div className={styles.resultInfo}>
                    <div className={styles.resultName}>{p.name}</div>
                    <div className={styles.resultMeta}>
                      <span className={styles.resultPrice}>₹{p.price?.toLocaleString('en-IN')}</span>
                      <span className={styles.resultCat}>{p.category}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className={styles.resultArrow} />
                </div>
              ))}
              {!searching && results.length > 0 && (
                <button className={styles.searchAllBtn} onClick={handleSearch}>
                  View all results for "{searchQ}" →
                </button>
              )}
              {!searching && results.length === 0 && searchQ && (
                <div className={styles.noResults}>No products found for "{searchQ}"</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── OVERLAY ── */}
      {menuOpen && <div className={styles.menuOverlay} onClick={closeMenu} />}

      {/* ── LEFT DRAWER ── */}
      <div className={`${styles.mobileDrawer} ${menuOpen ? styles.drawerOpen : ''}`}>

        {/* Header */}
        <div className={styles.drawerHeader}>
          <button className={styles.drawerClose} onClick={closeMenu}>
            <X size={20} />
          </button>
          <span className={styles.drawerLogo}>Ayezu <span>Collection</span></span>
        </div>

        {/* User info */}
        {user ? (
          <div className={styles.drawerUser}>
            <div className={styles.drawerAvatar}>{user.firstName?.[0]}</div>
            <div>
              <div className={styles.drawerName}>{user.firstName} {user.lastName}</div>
              <div className={styles.drawerEmail}>{user.email}</div>
            </div>
          </div>
        ) : (
          <div className={styles.drawerGuestBtns}>
            <Link to="/login"    className={styles.drawerGuestBtn} onClick={closeMenu}>Login</Link>
            <Link to="/register" className={styles.drawerGuestBtnOutline} onClick={closeMenu}>Register</Link>
          </div>
        )}

        {/* SHOP section */}
        <div className={styles.drawerSection}>
          <div className={styles.drawerSectionTitle}>🛍️ Shop</div>
          <Link to="/"                       className={styles.drawerLink} onClick={closeMenu}>
            <span>🏠 Home</span><ChevronRight size={15}/>
          </Link>
          <Link to="/shop?category=bedsheet" className={styles.drawerLink} onClick={closeMenu}>
            <span>🛏️ Bed Sheets</span><ChevronRight size={15}/>
          </Link>
          <Link to="/shop?category=kids"     className={styles.drawerLink} onClick={closeMenu}>
            <span>👗 Kids Wear</span><ChevronRight size={15}/>
          </Link>
          <Link to="/shop?category=women"    className={styles.drawerLink} onClick={closeMenu}>
            <span>✨ Women Wear</span><ChevronRight size={15}/>
          </Link>
          <Link to="/shop"                   className={styles.drawerLink} onClick={closeMenu}>
            <span>🏪 All Products</span><ChevronRight size={15}/>
          </Link>
        </div>

        {/* ACCOUNT section */}
        {user && (
          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionTitle}>👤 Account</div>
            <Link to="/orders"   className={styles.drawerLink} onClick={closeMenu}>
              <span>📦 My Orders</span><ChevronRight size={15}/>
            </Link>
            <Link to="/wishlist" className={styles.drawerLink} onClick={closeMenu}>
              <span>❤️ Wishlist {wishlist.length > 0 && <span className={styles.drawerBadge}>{wishlist.length}</span>}</span>
              <ChevronRight size={15}/>
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin"  className={styles.drawerLink} onClick={closeMenu}>
                <span>⚙️ Admin Panel</span><ChevronRight size={15}/>
              </Link>
            )}
          </div>
        )}

        {/* HELP section */}
        <div className={styles.drawerSection}>
          <div className={styles.drawerSectionTitle}>💬 Help & Info</div>
          <Link to="/faqs"            className={styles.drawerLink} onClick={closeMenu}>
            <span>❓ FAQs</span><ChevronRight size={15}/>
          </Link>
          <Link to="/shipping-info"   className={styles.drawerLink} onClick={closeMenu}>
            <span>🚚 Shipping Info</span><ChevronRight size={15}/>
          </Link>
          <Link to="/returns-refunds" className={styles.drawerLink} onClick={closeMenu}>
            <span>🔄 Returns & Refunds</span><ChevronRight size={15}/>
          </Link>
          <Link to="/track-order"     className={styles.drawerLink} onClick={closeMenu}>
            <span>📍 Track Order</span><ChevronRight size={15}/>
          </Link>
        </div>

        {/* Footer buttons */}
        <div className={styles.drawerFooter}>
          <button className={styles.drawerCartBtn} onClick={() => { setCartOpen(true); closeMenu() }}>
            <ShoppingCart size={17} />
            View Cart {cartCount > 0 && `(${cartCount})`}
          </button>
          {user && (
            <button className={styles.drawerLogout} onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          )}
        </div>

      </div>
    </>
  )
}
