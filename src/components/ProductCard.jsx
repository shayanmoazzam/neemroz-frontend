import React, { useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [wished, setWished] = useState(false)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '')

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  return (
    <div className={styles.card}>
      <div className={styles.imgWrap} onClick={() => navigate(`/product/${product.id}`)}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.badge && <div className={styles.badge}>{product.badge}</div>}
        {discount > 0 && <div className={styles.discount}>-{discount}%</div>}
        <button
          className={`${styles.wishBtn} ${wished ? styles.wished : ''}`}
          onClick={e => { e.stopPropagation(); setWished(w => !w) }}
        >
          <Heart size={15} fill={wished ? '#e53e3e' : 'none'} color={wished ? '#e53e3e' : 'currentColor'} />
        </button>
      </div>

      <div className={styles.info}>
        {product.colors?.length > 0 && (
          <div className={styles.colors}>
            {product.colors.map((c, i) => (
              <div
                key={i}
                className={`${styles.dot} ${selectedColor === c ? styles.activeDot : ''}`}
                style={{ background: c }}
                onClick={() => setSelectedColor(c)}
                title={c}
              />
            ))}
          </div>
        )}

        <div className={styles.name} onClick={() => navigate(`/product/${product.id}`)}>
          {product.name}
        </div>
        <div className={styles.desc}>{product.description?.split('.')[0]}</div>

        <div className={styles.bottom}>
          <div className={styles.priceWrap}>
            <span className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</span>
            {product.oldPrice && (
              <span className={styles.oldPrice}>₹{product.oldPrice?.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            className={styles.addBtn}
            onClick={() => addToCart(product.id, 1, product.sizes?.[0] || '', selectedColor)}
          >
            <ShoppingCart size={13} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
