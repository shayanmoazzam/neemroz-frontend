import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import styles from './Wishlist.module.css'

export default function Wishlist() {
  const { wishlist, toggle } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const discount = (p) => p.oldPrice
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Heart size={28} fill="var(--accent)" color="var(--accent)" />
          My Wishlist
        </h1>
        <p className={styles.sub}>{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
      </div>

      {wishlist.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💔</div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love by clicking the heart icon on any product.</p>
          <button className="btn-primary" onClick={() => navigate('/shop')}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {wishlist.map(product => (
              <div key={product.id} className={styles.card}>
                <div
                  className={styles.imgWrap}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img src={product.imageUrl} alt={product.name} />
                  {discount(product) > 0 && (
                    <div className={styles.discBadge}>-{discount(product)}%</div>
                  )}
                  {product.badge && (
                    <div className={styles.badge}>{product.badge}</div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div
                    className={styles.name}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                    {product.oldPrice && (
                      <span className={styles.oldPrice}>
                        ₹{product.oldPrice?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.cartBtn}
                      onClick={() => addToCart(product.id, 1, product.sizes?.[0], product.colors?.[0])}
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => toggle(product)}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="btn-outline" onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
          </div>
        </>
      )}
    </div>
  )
}
