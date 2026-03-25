import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Heart, ShoppingCart, Star, Shield,
  Truck, RefreshCw, ZoomIn, X, ChevronLeft, ChevronRight,
  Check, Package, Share2
} from 'lucide-react'
import api from '../api'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import StickyCart from '../components/StickyCart'
import styles from './ProductDetail.module.css'

const PHONE = '917001065007'

const COLOR_NAMES = {
  '#8B0000': 'Dark Red', '#CC0000': 'Scarlet Red', '#FF4500': 'Orange Red',
  '#800000': 'Maroon',   '#0A1172': 'Navy Blue',    '#1a237e': 'Navy Blue',
  '#000000': 'Black',    '#9B59B6': 'Purple',        '#E91E63': 'Pink',
  '#F0A500': 'Mustard',  '#5C3317': 'Brown',         '#555555': 'Grey',
  '#1a1a1a': 'Charcoal',
}

const INCLUDES = {
  bedsheet: ['1 Bedsheet', '2 Pillow Covers', 'Premium Cotton Fabric', 'Lace Border'],
  kids:     ['1 Kurta / Top', '1 Salwar / Gharara', '1 Dupatta', 'Festive Ready'],
  women:    ['1 Kurta', '1 Gharara / Salwar', '1 Dupatta', 'Premium Fabric'],
}

const FAKE_REVIEWS = [
  { name: 'Priya S.',  loc: 'Mumbai',    stars: 5, date: '2 weeks ago',  text: 'Absolutely stunning quality! The embroidery is even more beautiful in person. Very fast delivery too.' },
  { name: 'Rahul V.',  loc: 'Pune',      stars: 5, date: '1 month ago',  text: 'Ordered as a gift and everyone loved it. Premium feel, exactly as shown in photos.' },
  { name: 'Anjali M.', loc: 'Bangalore', stars: 4, date: '3 weeks ago',  text: 'Great product, fabric is very soft. Slight delay in delivery but overall very happy with the purchase.' },
]

export default function ProductDetail() {
  const { id }  = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct]         = useState(null)
  const [related, setRelated]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [activeImg, setActiveImg]     = useState(0)
  const [selectedSize, setSize]       = useState('')
  const [selectedColor, setColor]     = useState('')
  const [qty, setQty]                 = useState(1)
  const [wished, setWished]           = useState(false)
  const [zoomed, setZoomed]           = useState(false)
  const [added, setAdded]             = useState(false)
  const [activeTab, setActiveTab]     = useState('description')
  const [shareOpen, setShareOpen]     = useState(false)
  const thumbsRef = useRef(null)
  const shareWrapRef = useRef(null)

  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  useEffect(() => {
    setLoading(true)
    setActiveImg(0)
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data)
        setSize(r.data.sizes?.[0] || '')
        setColor(r.data.colors?.[0] || '')
        return api.get(`/products?category=${r.data.category}`)
      })
      .then(r => {
        const all = Array.isArray(r.data) ? r.data : []
        setRelated(all.filter(p => p.id !== Number(id)).slice(0, 4))
      })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [id])

  // Close share dropdown when tapping outside
  useEffect(() => {
    if (!shareOpen) return
    const handler = (e) => {
      if (shareWrapRef.current && !shareWrapRef.current.contains(e.target)) {
        setShareOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [shareOpen])

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingGrid}>
        <div className={styles.shimmerMain} />
        <div className={styles.shimmerInfo}>
          {[...Array(5)].map((_, i) => <div key={i} className={styles.shimmerLine} style={{ width: `${[70,50,40,90,60][i]}%` }} />)}
        </div>
      </div>
    </div>
  )
  if (!product) return null

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0
  const images = product.images?.length ? product.images : [product.imageUrl]
  const includes = INCLUDES[product.category] || []

  const handleAddToCart = () => {
    addToCart(product.id, qty, selectedSize, selectedColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setActiveImg(i => (i + 1) % images.length)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      deltaX < 0 ? nextImg() : prevImg()
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href })
    } else {
      setShareOpen(s => !s)
    }
  }

  const handleWhatsApp = () => {
    const colorName = COLOR_NAMES[selectedColor] || selectedColor
    const msg = [
      `👋 Hi! I'm interested in ordering this product from Ayezu Collection:`,
      ``,
      `🛍️ *${product.name}*`,
      `💰 Price: ₹${product.price?.toLocaleString('en-IN')}${product.oldPrice ? ` (was ₹${product.oldPrice?.toLocaleString('en-IN')})` : ''}`,
      selectedSize  ? `📐 Size: ${selectedSize}` : '',
      selectedColor ? `🎨 Color: ${colorName}` : '',
      `🔢 Quantity: ${qty}`,
      `🔗 ${window.location.href}`,
      ``,
      `Please confirm availability and help me place the order. Thank you!`,
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank')
    setShareOpen(false)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setShareOpen(false)
  }

  return (
    <div className={styles.page}>

      {/* BREADCRUMB */}
      <div className={styles.breadcrumb}>
        <span onClick={() => navigate('/')}>Home</span>
        <span className={styles.sep}>›</span>
        <span onClick={() => navigate('/shop')}>Shop</span>
        <span className={styles.sep}>›</span>
        <span onClick={() => navigate(`/shop?category=${product.category}`)} style={{ textTransform: 'capitalize' }}>
          {product.category === 'bedsheet' ? 'Bed Sheets' : product.category === 'kids' ? 'Kids Wear' : 'Women Wear'}
        </span>
        <span className={styles.sep}>›</span>
        <span className={styles.breadActive}>{product.name}</span>
      </div>

      <div className={styles.container}>

        {/* LEFT: Gallery */}
        <div className={styles.gallery}>
          {images.length > 1 && (
            <div className={styles.thumbsCol} ref={thumbsRef}>
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

          <div className={styles.mainImgWrap}>
            <div
              className={styles.mainImg}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img src={images[activeImg]} alt={product.name} key={activeImg} className={styles.mainImgEl} />
              {discount > 0 && <div className={styles.discBadge}>-{discount}%</div>}
              {product.badge && <div className={styles.badge}>{product.badge}</div>}
              <button className={styles.zoomBtn} onClick={() => setZoomed(true)}>
                <ZoomIn size={16} />
              </button>
              {images.length > 1 && (
                <>
                  <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevImg}>
                    <ChevronLeft size={18} />
                  </button>
                  <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextImg}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.imgDots}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.imgDot} ${activeImg === i ? styles.imgDotActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className={styles.info}>

          <div className={styles.topRow}>
            <span className={styles.category}>
              {product.category === 'bedsheet' ? '🛏️ Bed Sheet' : product.category === 'kids' ? '👗 Kids Wear' : '✨ Women Wear'}
            </span>
            <div className={styles.topActions}>
              <div className={styles.shareWrap} ref={shareWrapRef}>
                <button className={styles.shareBtn} onClick={handleShare} title="Share">
                  <Share2 size={15} />
                </button>
                {shareOpen && (
                  <div className={styles.shareMenu}>
                    <button className={styles.shareMenuItem} onClick={handleWhatsApp}>
                      <span>💬</span> Share on WhatsApp
                    </button>
                    <button className={styles.shareMenuItem} onClick={handleCopyLink}>
                      <span>🔗</span> Copy Link
                    </button>
                  </div>
                )}
              </div>
              <button
                className={`${styles.wishBtn} ${wished ? styles.wished : ''}`}
                onClick={() => setWished(w => !w)}
                title="Wishlist"
              >
                <Heart size={17} fill={wished ? '#e53e3e' : 'none'} color={wished ? '#e53e3e' : 'currentColor'} />
              </button>
            </div>
          </div>

          <h1 className={styles.name}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(product.rating) ? '#E8A838' : 'none'} color="#E8A838" />
              ))}
            </div>
            <span className={styles.ratingVal}>{product.rating?.toFixed(1)}</span>
            <span className={styles.rCount}>({product.reviewCount} reviews)</span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className={styles.lowStock}>⚠️ Only {product.stock} left!</span>
            )}
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</span>
            {product.oldPrice && (
              <span className={styles.oldPrice}>₹{product.oldPrice?.toLocaleString('en-IN')}</span>
            )}
            {discount > 0 && <span className={styles.save}>Save {discount}%</span>}
          </div>

          <div className={styles.divider} />

          {product.colors?.length > 0 && (
            <div className={styles.optionGroup}>
              <div className={styles.optionLabel}>
                Color — <span className={styles.optionVal}>{COLOR_NAMES[selectedColor] || selectedColor}</span>
              </div>
              <div className={styles.colorDots}>
                {product.colors.map((c, i) => (
                  <div
                    key={i}
                    className={`${styles.colorDot} ${selectedColor === c ? styles.activeDot : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    title={COLOR_NAMES[c] || c}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className={styles.optionGroup}>
              <div className={styles.optionLabel}>
                Size — <span className={styles.optionVal}>{selectedSize}</span>
                <span className={styles.sizeGuideLink} onClick={() => navigate('/size-guide')}>Size Guide →</span>
              </div>
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

          <div className={styles.optionGroup}>
            <div className={styles.optionLabel}>Quantity</div>
            <div className={styles.qtyRow}>
              <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className={styles.qtyVal}>{qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              <span className={styles.stockNote}>{product.stock} in stock</span>
            </div>
          </div>

          <div className={styles.actions} id="product-actions">
            <button
              className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
              onClick={handleAddToCart}
            >
              {added ? <><Check size={16}/> Added!</> : <><ShoppingCart size={16}/> Add to Cart</>}
            </button>
            <button
              className={styles.buyBtn}
              onClick={() => { handleAddToCart(); navigate('/checkout') }}
            >
              Buy Now
            </button>
          </div>

          {/* WhatsApp Enquiry CTA */}
          <button className={styles.waBtn} onClick={handleWhatsApp}>
            <svg viewBox="0 0 32 32" width="18" height="18" style={{flexShrink:0}}>
              <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.738 5.49 2.031 7.807L0 32l8.418-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.784-1.858l-.486-.29-5.001 1.193 1.216-4.872-.317-.499A13.26 13.26 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.862c-.398-.2-2.355-1.162-2.72-1.294-.366-.133-.633-.2-.9.2-.266.398-1.031 1.294-1.265 1.56-.233.266-.466.3-.864.1-.398-.2-1.682-.62-3.203-1.977-1.184-1.056-1.983-2.36-2.216-2.758-.233-.398-.025-.614.175-.812.18-.178.398-.466.598-.698.2-.233.266-.4.4-.666.133-.267.066-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.324-.78-.654-.674-.9-.686l-.766-.013c-.266 0-.7.1-1.066.5-.366.398-1.4 1.367-1.4 3.334s1.433 3.867 1.633 4.133c.2.267 2.82 4.302 6.833 6.035.954.412 1.699.658 2.28.843.957.305 1.829.262 2.517.159.768-.115 2.355-.963 2.688-1.893.333-.93.333-1.727.233-1.893-.1-.167-.366-.267-.764-.467z" fill="#25D366"/>
            </svg>
            Enquire on WhatsApp
          </button>

          <div className={styles.trust}>
            <div className={styles.trustItem}><Truck size={14}/> Free delivery above ₹799</div>
            <div className={styles.trustItem}><RefreshCw size={14}/> 7-day easy returns</div>
            <div className={styles.trustItem}><Shield size={14}/> 100% secure checkout</div>
            <div className={styles.trustItem}><Package size={14}/> Packed within 24 hours</div>
          </div>

          {includes.length > 0 && (
            <div className={styles.includes}>
              <div className={styles.includesTitle}>📦 What's Included</div>
              <div className={styles.includesGrid}>
                {includes.map((item, i) => (
                  <div key={i} className={styles.includeItem}>
                    <Check size={13} className={styles.includeCheck} /> {item}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        <div className={styles.tabBar}>
          {['description', 'details', 'reviews'].map(t => (
            <button
              key={t}
              className={`${styles.tabBtn} ${activeTab === t ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'description' ? '📝 Description' : t === 'details' ? '📋 Details' : `⭐ Reviews (${product.reviewCount})`}
            </button>
          ))}
        </div>
        <div className={styles.tabContent}>
          {activeTab === 'description' && <p className={styles.desc}>{product.description}</p>}
          {activeTab === 'details' && (
            <div className={styles.detailsTable}>
              <div className={styles.detailRow}><span>Category</span><span style={{ textTransform: 'capitalize' }}>{product.category}</span></div>
              <div className={styles.detailRow}><span>Material</span><span>100% Pure Cotton</span></div>
              <div className={styles.detailRow}><span>Available Sizes</span><span>{product.sizes?.join(', ')}</span></div>
              <div className={styles.detailRow}><span>Care</span><span>Machine wash cold, gentle cycle</span></div>
              <div className={styles.detailRow}><span>Rating</span><span>{product.rating} / 5 ★</span></div>
              <div className={styles.detailRow}><span>Stock</span><span>{product.stock} units available</span></div>
              <div className={styles.detailRow}><span>SKU</span><span>AYZ-{String(product.id).padStart(4, '0')}</span></div>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className={styles.reviewsList}>
              <div className={styles.reviewSummary}>
                <div className={styles.reviewBig}>{product.rating?.toFixed(1)}</div>
                <div>
                  <div className={styles.reviewBigStars}>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</div>
                  <div className={styles.reviewBigCount}>Based on {product.reviewCount} reviews</div>
                </div>
              </div>
              {FAKE_REVIEWS.map((r, i) => (
                <div key={i} className={styles.reviewItem}>
                  <div className={styles.reviewItemTop}>
                    <div className={styles.reviewItemAvatar}>{r.name[0]}</div>
                    <div>
                      <div className={styles.reviewItemName}>{r.name} <span className={styles.reviewItemLoc}>— {r.loc}</span></div>
                      <div className={styles.reviewItemStars}>{'★'.repeat(r.stars)}</div>
                    </div>
                    <span className={styles.reviewItemDate}>{r.date}</span>
                  </div>
                  <p className={styles.reviewItemText}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div className={styles.related}>
          <div className="section-head">
            <div className="section-eyebrow">You May Also Like</div>
            <h2 className="section-title">Related <em>Products</em></h2>
            <div className="divider" />
          </div>
          <div className={styles.relatedGrid}>
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* ZOOM MODAL */}
      {zoomed && (
        <div className={styles.zoomOverlay} onClick={() => setZoomed(false)}>
          <button className={styles.zoomClose}><X size={22} /></button>
          <img
            src={images[activeImg]}
            alt={product.name}
            className={styles.zoomedImg}
            onClick={e => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button className={`${styles.zoomNav} ${styles.zoomPrev}`} onClick={e => { e.stopPropagation(); prevImg() }}>
                <ChevronLeft size={28} />
              </button>
              <button className={`${styles.zoomNav} ${styles.zoomNext}`} onClick={e => { e.stopPropagation(); nextImg() }}>
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>
      )}

      <StickyCart
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        qty={qty}
      />

    </div>
  )
}
