import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggle, isWished } = useWishlist()
  const wished = isWished(product.id)

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0

  return (
    <div className={styles.card} onClick={() => navigate(`/product/${product.id}`)}>
      <div className={styles.imgWrap}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {discount > 0 && <div className={styles.discBadge}>-{discount}%</div>}
        {product.badge && <div className={styles.badge}>{product.badge}</div>}

        <button
          className={`${styles.wishBtn} ${wished ? styles.wished : ''}`}
          onClick={e => { e.stopPropagation(); toggle(product) }}
          title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={wished ? '#e53e3e' : 'none'} color={wished ? '#e53e3e' : 'currentColor'} />
        </button>

        <button
          className={styles.cartOverlay}
          onClick={e => {
            e.stopPropagation()
            addToCart(product.id, 1, product.sizes?.[0], product.colors?.[0])
          }}
        >
          <ShoppingCart size={15} /> Add to Cart
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.name}>{product.name}</div>
        {product.rating && (
          <div className={styles.rating}>
            {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
            <span>{product.rating?.toFixed(1)}</span>
          </div>
        )}
        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</span>
          {product.oldPrice && (
            <span className={styles.oldPrice}>₹{product.oldPrice?.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  )
}
