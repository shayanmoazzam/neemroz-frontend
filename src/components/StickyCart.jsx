import React, { useEffect, useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import styles from './StickyCart.module.css'

export default function StickyCart({ product, selectedSize, selectedColor, qty }) {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const anchor = document.getElementById('product-actions')
    if (!anchor) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(anchor)
    return () => observer.disconnect()
  }, [])

  if (!visible) return null

  const handleAdd = () => {
    addToCart(product.id, qty, selectedSize, selectedColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        <img src={product.images?.[0] || product.imageUrl} alt={product.name} className={styles.thumb} />
        <div>
          <div className={styles.name}>{product.name}</div>
          <div className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</div>
        </div>
      </div>
      <div className={styles.btns}>
        <button className={`${styles.addBtn} ${added ? styles.added : ''}`} onClick={handleAdd}>
          {added ? <><Check size={15}/> Added!</> : <><ShoppingCart size={15}/> Add to Cart</>}
        </button>
        <button className={styles.buyBtn} onClick={() => { handleAdd(); navigate('/checkout') }}>
          Buy Now
        </button>
      </div>
    </div>
  )
}
