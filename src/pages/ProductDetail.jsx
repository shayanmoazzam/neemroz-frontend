import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star, ArrowLeft, Shield, Truck, RefreshCw } from 'lucide-react'
import api from '../api'
import { useCart } from '../context/CartContext'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [activeImg, setActiveImg]   = useState(0)
  const [selectedSize, setSize]     = useState('')
  const [selectedColor, setColor]   = useState('')
  const [qty, setQty]               = useState(1)
  const [wished, setWished]         = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data)
        setSize(r.data.sizes?.[0] || '')
        setColor(r.data.colors?.[0] || '')
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className={styles.loading}>Loading...</div>
  if (!product) return null

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  const images = product.images?.length ? product.images : [product.imageUrl]

  const handleAddToCart = () => {
    addToCart(product.id, qty, selectedSize, selectedColor)
  }

  return (
    <div className={styles.page}>

      {/* Back */}
      <button className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className={styles.container}>

        {/* ── LEFT: Images ── */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            <img src={images[activeImg]} alt={product.name} />
            {discount > 0 && <div className={styles.discBadge}>-{discount}%</div>}
            {product.badge && <div className={styles.badge}>{product.badge}</div>}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`${styles.thumb} ${activeImg === i ? styles.activeThumb : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`view ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Info ── */}
        <div className={styles.info}>

          <div className={styles.topRow}>
            <span className={styles.category}>{product.category}</span>
            <button
              className={`${styles.wishBtn} ${wished ? styles.wished : ''}`}
              onClick={() => setWished(w => !w)}
            >
              <Heart size={18} fill={wished ? '#e53e3e' : 'none'} color={wished ? '#e53e3e' : 'currentColor'} />
            </button>
          </div>

          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.rating}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < Math.round(product.rating) ? '#E8A838' : 'none'} color="#E8A838" />
            ))}
            <span>{product.rating?.toFixed(1)}</span>
            <span className={styles.rCount}>({product.reviewCount} reviews)</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</span>
            {product.oldPrice && (
              <span className={styles.oldPrice}>₹{product.oldPrice?.toLocaleString('en-IN')}</span>
            )}
            {discount > 0 && <span className={styles.save}>Save {discount}%</span>}
          </div>

          <p className={styles.desc}>{product.description}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className={styles.optionGroup}>
              <div className={styles.optionLabel}>Color</div>
              <div className={styles.colorDots}>
                {product.colors.map((c, i) => (
                  <div
                    key={i}
                    className={`${styles.dot} ${selectedColor === c ? styles.activeDot : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className={styles.optionGroup}>
              <div className={styles.optionLabel}>Size</div>
              <div className={styles.sizes}>
                {product.sizes.map(s => (
                  <button
                    key={s}
                    className={`${styles.sizeBtn} ${selectedSize === s ? styles.activeSizeBtn : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className={styles.optionGroup}>
            <div className={styles.optionLabel}>Quantity</div>
            <div className={styles.qtyRow}>
              <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className={styles.qtyVal}>{qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.addBtn} onClick={handleAddToCart}>
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <button className={styles.buyBtn} onClick={() => { handleAddToCart(); navigate('/checkout') }}>
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className={styles.trust}>
            <div className={styles.trustItem}><Truck size={15} /> Free delivery above ₹799</div>
            <div className={styles.trustItem}><RefreshCw size={15} /> 30-day easy returns</div>
            <div className={styles.trustItem}><Shield size={15} /> Secure checkout</div>
          </div>

        </div>
      </div>
    </div>
  )
}
