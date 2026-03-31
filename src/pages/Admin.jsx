import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, ShoppingBag, Users, TrendingUp,
  Plus, Pencil, Trash2, X, Check, AlertTriangle,
  ChevronDown, ChevronUp, Search, Upload, ImagePlus, Mail, Tag, GripVertical
} from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Admin.module.css'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', description: '', price: '', oldPrice: '',
  category: 'bedsheet', imageUrl: '', images: [], badge: '',
  sizes: '', colors: '', stock: '', rating: '4.5', reviewCount: ''
}

const EMPTY_COUPON = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxUses: '',
  expiresAt: '',
  applicability: 'all',
  applicableCategories: [],
  applicableProductIds: [],
  isActive: true,
}

const STATUS_COLORS = {
  pending:    { color: '#856404', bg: '#fff3cd' },
  processing: { color: '#0c63e4', bg: '#cfe2ff' },
  shipped:    { color: '#0a5c2e', bg: '#d1e7dd' },
  delivered:  { color: '#0a3622', bg: '#badbcc' },
  cancelled:  { color: '#842029', bg: '#f8d7da' },
}

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const ALL_CATEGORIES = ['bedsheet', 'kids', 'women']

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const urlInputRef  = useRef(null)
  const dragIndex    = useRef(null)

  const [tab, setTab]               = useState('dashboard')
  const [products, setProducts]     = useState([])
  const [orders, setOrders]         = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [coupons, setCoupons]       = useState([])
  const [subLoading, setSubLoading] = useState(false)
  const [subSearch, setSubSearch]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [editId, setEditId]         = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [delConfirm, setDelConfirm] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [urlDraft, setUrlDraft]     = useState('')
  const [search, setSearch]         = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [couponForm, setCouponForm]       = useState(EMPTY_COUPON)
  const [couponEditId, setCouponEditId]   = useState(null)
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [couponSaving, setCouponSaving]   = useState(false)
  const [couponSearch, setCouponSearch]   = useState('')
  const [delCouponConfirm, setDelCouponConfirm] = useState(null)
  const [productSearch, setProductSearch] = useState('')

  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAuthChecked(true), 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!authChecked) return
    if (!user) {
      navigate('/login?redirect=/admin', { replace: true })
      return
    }
    if (user.role?.toUpperCase() !== 'ADMIN') {
      toast.error('Access denied. Admin only.')
      navigate('/', { replace: true })
    }
  }, [user, authChecked])

  const loadData = () => {
    Promise.all([
      api.get('/products'),
      api.get('/orders/all').catch(() => api.get('/orders')),
      api.get('/newsletter/subscribers').catch(() => ({ data: [] })),
      api.get('/coupons').catch(() => ({ data: [] })),
    ]).then(([p, o, s, c]) => {
      setProducts(Array.isArray(p.data) ? p.data : [])
      setOrders(Array.isArray(o.data) ? o.data : [])
      setSubscribers(Array.isArray(s.data) ? s.data : [])
      setCoupons(Array.isArray(c.data) ? c.data : [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (tab === 'subscribers' && subscribers.length === 0) {
      setSubLoading(true)
      api.get('/newsletter/subscribers')
        .then(r => setSubscribers(Array.isArray(r.data) ? r.data : []))
        .catch(() => toast.error('Failed to load subscribers'))
        .finally(() => setSubLoading(false))
    }
  }, [tab])

  useEffect(() => {
    if (tab === 'coupons') {
      api.get('/coupons')
        .then(r => setCoupons(Array.isArray(r.data) ? r.data : []))
        .catch(() => {})
    }
  }, [tab])

  const handleDeleteSubscriber = async (id) => {
    try {
      await api.delete(`/newsletter/subscribers/${id}`)
      setSubscribers(prev => prev.filter(s => s.id !== id))
      toast.success('Subscriber removed')
    } catch {
      toast.error('Failed to remove subscriber')
    }
  }

  // ── MULTI-IMAGE HELPERS ──────────────────────────────────────
  // Returns current images array (normalised from form state)
  const getImages = () => {
    const imgs = Array.isArray(form.images) ? [...form.images] : []
    // Keep backward-compat: if imageUrl exists but not in array, prepend it
    if (form.imageUrl && !imgs.includes(form.imageUrl)) imgs.unshift(form.imageUrl)
    return imgs
  }

  const setImages = (imgs) => {
    setForm(f => ({
      ...f,
      images: imgs,
      imageUrl: imgs[0] || '',   // first image is always the primary
    }))
  }

  // Upload a file and add to gallery
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        return res.data.url
      }))
      setImages([...getImages(), ...uploaded])
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded!`)
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Add a URL manually
  const handleAddUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    if (getImages().includes(url)) {
      toast.error('This URL is already added')
      return
    }
    setImages([...getImages(), url])
    setUrlDraft('')
  }

  const handleRemoveImage = (idx) => {
    const imgs = getImages()
    imgs.splice(idx, 1)
    setImages(imgs)
  }

  // Drag-to-reorder
  const handleDragStart = (idx) => { dragIndex.current = idx }
  const handleDrop = (idx) => {
    if (dragIndex.current === null || dragIndex.current === idx) return
    const imgs = getImages()
    const moved = imgs.splice(dragIndex.current, 1)[0]
    imgs.splice(idx, 0, moved)
    dragIndex.current = null
    setImages(imgs)
  }
  // ────────────────────────────────────────────────────────────

  const stats = [
    { icon: <Package size={22}/>,     label: 'Total Products',  value: products.length,      color: '#8B0000' },
    { icon: <ShoppingBag size={22}/>, label: 'Total Orders',    value: orders.length,        color: '#C4622D' },
    { icon: <TrendingUp size={22}/>,  label: 'Revenue',         value: `\u20b9${orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || o.total || 0), 0).toLocaleString('en-IN')}`, color: '#2d8a4e' },
    { icon: <Mail size={22}/>,        label: 'Subscribers',     value: subscribers.length,   color: '#6B21A8' },
  ]

  const openAdd = () => { setForm(EMPTY_FORM); setUrlDraft(''); setEditId(null); setShowForm(true) }
  const openEdit = (p) => {
    // Normalise images: use p.images array if it exists, else fall back to imageUrl
    const imgs = Array.isArray(p.images) && p.images.length
      ? p.images
      : (p.imageUrl ? [p.imageUrl] : [])
    setForm({
      ...p,
      images: imgs,
      imageUrl: imgs[0] || p.imageUrl || '',
      sizes: p.sizes?.join(', ') || '',
      colors: p.colors?.join(', ') || '',
      oldPrice: p.oldPrice || ''
    })
    setUrlDraft('')
    setEditId(p.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    const imgs = getImages()
    if (!form.name || !form.price || imgs.length === 0) {
      toast.error('Name, price and at least one image are required')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      imageUrl: imgs[0],
      images: imgs,
      price: Number(form.price), oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock: Number(form.stock) || 0, rating: Number(form.rating) || 4.5,
      reviewCount: Number(form.reviewCount) || 0,
      sizes:  form.sizes  ? form.sizes.split(',').map(s => s.trim()).filter(Boolean)  : [],
      colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
    }
    try {
      if (editId) {
        const res = await api.put(`/products/${editId}`, payload)
        setProducts(prev => prev.map(p => p.id === editId ? res.data : p))
      } else {
        const res = await api.post('/products', payload)
        setProducts(prev => [...prev, res.data])
      }
      setShowForm(false)
      toast.success(editId ? 'Product updated!' : 'Product added!')
    } catch { toast.error('Error saving product') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
      setDelConfirm(null)
      toast.success('Product deleted')
    } catch { toast.error('Error deleting product') }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(orderId)
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      toast.success(`Order #${orderId} marked as ${newStatus}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // ── COUPON HANDLERS ──
  const openAddCoupon = () => { setCouponForm(EMPTY_COUPON); setCouponEditId(null); setShowCouponForm(true); setProductSearch('') }
  const openEditCoupon = (c) => {
    setCouponForm({
      code: c.code || '',
      discountType: c.discountType || 'percentage',
      discountValue: c.discountValue || '',
      minOrderAmount: c.minOrderAmount || '',
      maxUses: c.maxUses || '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      applicability: c.applicability || 'all',
      applicableCategories: c.applicableCategories || [],
      applicableProductIds: c.applicableProductIds || [],
      isActive: c.isActive !== false,
    })
    setCouponEditId(c.id)
    setShowCouponForm(true)
    setProductSearch('')
  }

  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim() || !couponForm.discountValue) {
      toast.error('Coupon code and discount value are required')
      return
    }
    setCouponSaving(true)
    const payload = {
      ...couponForm,
      code: couponForm.code.trim().toUpperCase(),
      discountValue: Number(couponForm.discountValue),
      minOrderAmount: couponForm.minOrderAmount ? Number(couponForm.minOrderAmount) : 0,
      maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null,
      expiresAt: couponForm.expiresAt || null,
      applicableCategories: couponForm.applicability === 'category' ? couponForm.applicableCategories : [],
      applicableProductIds: couponForm.applicability === 'products' ? couponForm.applicableProductIds : [],
    }
    try {
      if (couponEditId) {
        const res = await api.put(`/coupons/${couponEditId}`, payload)
        setCoupons(prev => prev.map(c => c.id === couponEditId ? res.data : c))
        toast.success('Coupon updated!')
      } else {
        const res = await api.post('/coupons', payload)
        setCoupons(prev => [...prev, res.data])
        toast.success('Coupon created!')
      }
      setShowCouponForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving coupon')
    } finally {
      setCouponSaving(false)
    }
  }

  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/coupons/${id}`)
      setCoupons(prev => prev.filter(c => c.id !== id))
      setDelCouponConfirm(null)
      toast.success('Coupon deleted')
    } catch {
      toast.error('Error deleting coupon')
    }
  }

  const toggleCouponActive = async (c) => {
    try {
      const res = await api.patch(`/coupons/${c.id}/toggle`)
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: res.data?.isActive ?? !c.isActive } : x))
      toast.success(c.isActive ? 'Coupon disabled' : 'Coupon enabled')
    } catch {
      toast.error('Failed to toggle coupon')
    }
  }

  const toggleCategory = (cat) => {
    setCouponForm(f => ({
      ...f,
      applicableCategories: f.applicableCategories.includes(cat)
        ? f.applicableCategories.filter(c => c !== cat)
        : [...f.applicableCategories, cat]
    }))
  }

  const toggleProduct = (id) => {
    setCouponForm(f => ({
      ...f,
      applicableProductIds: f.applicableProductIds.includes(id)
        ? f.applicableProductIds.filter(p => p !== id)
        : [...f.applicableProductIds, id]
    }))
  }

  const filteredOrders = orders.filter(o => {
    const matchSearch =
      String(o.id).includes(orderSearch) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.shippingPhone || o.phone || '').includes(orderSearch)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredSubscribers = subscribers.filter(s =>
    s.email?.toLowerCase().includes(subSearch.toLowerCase())
  )

  const filteredCoupons = coupons.filter(c =>
    c.code?.toLowerCase().includes(couponSearch.toLowerCase())
  )

  const modalFilteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  )

  if (loading) return <div className={styles.loading}>Loading admin panel...</div>

  // Computed images for the open form
  const formImages = getImages()

  return (
    <div className={styles.page}>

      <button className={styles.menuToggle} onClick={() => setSidebarOpen(o => !o)}>☰ Menu</button>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>⚙️ Admin Panel</div>
        <nav className={styles.sideNav}>
          {[
            { key: 'dashboard',   label: '\ud83d\udcca Dashboard' },
            { key: 'products',    label: '\ud83d\udce6 Products' },
            { key: 'orders',      label: '\ud83d\uded2 Orders' },
            { key: 'coupons',     label: '\ud83c\udff7\ufe0f Coupons' },
            { key: 'subscribers', label: '\ud83d\udce7 Subscribers' },
          ].map(item => (
            <button
              key={item.key}
              className={`${styles.sideItem} ${tab === item.key ? styles.sideActive : ''}`}
              onClick={() => { setTab(item.key); setSidebarOpen(false) }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button className={styles.sideBack} onClick={() => navigate('/')}>\u2190 Back to Site</button>
      </aside>

      <main className={styles.main}>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <div className={styles.statsGrid}>
              {stats.map(s => (
                <div key={s.label} className={styles.statCard} style={{ borderLeftColor: s.color }}>
                  <div className={styles.statIcon} style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
                  <div>
                    <div className={styles.statVal}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.statusBreakdown}>
              {ALL_STATUSES.map(st => {
                const count = orders.filter(o => o.status === st).length
                const cfg = STATUS_COLORS[st]
                return (
                  <div key={st} className={styles.statusTile} style={{ borderColor: cfg.color, background: cfg.bg }}>
                    <div className={styles.statusTileCount} style={{ color: cfg.color }}>{count}</div>
                    <div className={styles.statusTileLabel} style={{ color: cfg.color }}>{st.charAt(0).toUpperCase() + st.slice(1)}</div>
                  </div>
                )
              })}
            </div>

            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map(o => {
                    const cfg = STATUS_COLORS[o.status] || STATUS_COLORS.pending
                    return (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{o.shippingName || `${o.firstName || ''} ${o.lastName || ''}`.trim() || '\u2014'}</td>
                        <td>{o.items?.length || 0} items</td>
                        <td>\u20b9{(o.totalAmount || o.total)?.toLocaleString('en-IN')}</td>
                        <td><span className={styles.statusBadge} style={{ color: cfg.color, background: cfg.bg }}>{o.status || 'pending'}</span></td>
                        <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>Products ({products.length})</h1>
              <div className={styles.topBarRight}>
                <div className={styles.searchBox}><Search size={15}/><input className={styles.searchInput} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <button className={styles.addBtn} onClick={openAdd}><Plus size={16} /> Add Product</button>
              </div>
            </div>

            <div className={`${styles.tableWrap} ${styles.desktopOnly}`}>
              <table className={styles.table}>
                <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Badge</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.imageUrl} alt={p.name} className={styles.productThumb} /></td>
                      <td className={styles.productName}>{p.name}</td>
                      <td><span className={styles.catTag}>{p.category}</span></td>
                      <td>\u20b9{p.price?.toLocaleString('en-IN')}{p.oldPrice && <span className={styles.oldPriceTag}> \u20b9{p.oldPrice}</span>}</td>
                      <td><span className={p.stock <= 5 ? styles.lowStock : styles.stockOk}>{p.stock}</span></td>
                      <td>{p.badge ? <span className={styles.badgeTag}>{p.badge}</span> : '\u2014'}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button className={styles.editBtn} onClick={() => openEdit(p)}><Pencil size={14} /></button>
                          <button className={styles.deleteBtn} onClick={() => setDelConfirm(p.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`${styles.productCards} ${styles.mobileOnly}`}>
              {filteredProducts.length === 0 ? (
                <div className={styles.empty}>No products found.</div>
              ) : filteredProducts.map(p => (
                <div key={p.id} className={styles.productCardItem}>
                  <img src={p.imageUrl} alt={p.name} className={styles.productCardImg} />
                  <div className={styles.productCardInfo}>
                    <div className={styles.productCardName}>{p.name}</div>
                    <div className={styles.productCardMeta}>
                      <span className={styles.catTag}>{p.category}</span>
                      <span>\u20b9{p.price?.toLocaleString('en-IN')}</span>
                      <span className={p.stock <= 5 ? styles.lowStock : styles.stockOk}>Stock: {p.stock}</span>
                      {p.badge && <span className={styles.badgeTag}>{p.badge}</span>}
                    </div>
                  </div>
                  <div className={styles.productCardActions}>
                    <button className={styles.editBtn} onClick={() => openEdit(p)}><Pencil size={14} /></button>
                    <button className={styles.deleteBtn} onClick={() => setDelConfirm(p.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div>
            <h1 className={styles.pageTitle}>All Orders ({filteredOrders.length})</h1>

            <div className={styles.orderFilters}>
              <div className={styles.searchBox}>
                <Search size={15}/>
                <input
                  className={styles.searchInput}
                  placeholder="Search by order ID, name, phone..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                />
              </div>
              <div className={styles.statusTabs}>
                {['all', ...ALL_STATUSES].map(s => (
                  <button
                    key={s}
                    className={`${styles.statusTab} ${statusFilter === s ? styles.statusTabActive : ''}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    <span className={styles.statusTabCount}>
                      {s === 'all' ? orders.length : orders.filter(o => o.status === s).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className={styles.empty}>No orders found.</div>
            ) : (
              <div className={styles.orderCards}>
                {filteredOrders.map(o => {
                  const cfg = STATUS_COLORS[o.status] || STATUS_COLORS.pending
                  const isExpanded = expandedOrder === o.id
                  return (
                    <div key={o.id} className={styles.orderCard}>
                      <div className={styles.orderCardHead} onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                        <div className={styles.orderCardLeft}>
                          <div className={styles.orderCardId}>Order #{o.id}</div>
                          <div className={styles.orderCardCustomer}>
                            \ud83d\udc64 {o.shippingName || `${o.firstName || ''} ${o.lastName || ''}`.trim() || 'Customer'}
                          </div>
                          <div className={styles.orderCardMeta}>
                            \ud83d\udcde {o.shippingPhone || o.phone || '\u2014'} &nbsp;\u00b7&nbsp;
                            \ud83d\udcc5 {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className={styles.orderCardRight}>
                          <div className={styles.orderCardTotal}>\u20b9{(o.totalAmount || o.total)?.toLocaleString('en-IN')}</div>
                          <span className={styles.statusBadge} style={{ color: cfg.color, background: cfg.bg }}>
                            {o.status || 'pending'}
                          </span>
                          {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={styles.orderCardBody}>
                          <div className={styles.orderItemsList}>
                            <div className={styles.orderSectionLabel}>\ud83d\udce6 Items Ordered</div>
                            {o.items?.map((item, i) => (
                              <div key={i} className={styles.orderItemRow}>
                                <img
                                  src={item.imageUrl || item.product?.imageUrl}
                                  alt={item.name || item.product?.name}
                                  className={styles.orderItemImg}
                                />
                                <div className={styles.orderItemInfo}>
                                  <div className={styles.orderItemName}>{item.name || item.product?.name}</div>
                                  <div className={styles.orderItemMeta}>Qty: {item.quantity} \u00b7 \u20b9{item.price?.toLocaleString('en-IN')}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className={styles.orderAddress}>
                            <div className={styles.orderSectionLabel}>\ud83d\udccd Shipping Address</div>
                            <div className={styles.orderAddressText}>
                              {o.shippingAddress || o.address}, {o.shippingCity || o.city}, {o.shippingState || o.state} \u2013 {o.shippingPinCode || o.pinCode}
                            </div>
                          </div>

                          <div className={styles.orderMeta2}>
                            <div><span className={styles.metaLabel}>Payment:</span> {o.paymentMethod || '\u2014'}</div>
                            {o.couponDiscount > 0 && <div><span className={styles.metaLabel}>Coupon Discount:</span> \u2212\u20b9{o.couponDiscount}</div>}
                          </div>

                          {o.status === 'cancelled' && o.cancelReason && (
                            <div className={styles.cancelNote}>
                              \u274c Cancelled by user: <em>{o.cancelReason}</em>
                            </div>
                          )}

                          <div className={styles.statusChanger}>
                            <div className={styles.orderSectionLabel}>\ud83d\udd04 Update Status</div>
                            <div className={styles.statusBtns}>
                              {ALL_STATUSES.map(s => (
                                <button
                                  key={s}
                                  className={`${styles.statusBtn} ${o.status === s ? styles.statusBtnActive : ''}`}
                                  style={o.status === s ? { background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].color, borderColor: STATUS_COLORS[s].color } : {}}
                                  onClick={() => handleStatusChange(o.id, s)}
                                  disabled={updatingStatus === o.id || o.status === s}
                                >
                                  {updatingStatus === o.id && o.status !== s ? '...' : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── COUPONS ── */}
        {tab === 'coupons' && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>\ud83c\udff7\ufe0f Coupons ({filteredCoupons.length})</h1>
              <div className={styles.topBarRight}>
                <div className={styles.searchBox}>
                  <Search size={15}/>
                  <input
                    className={styles.searchInput}
                    placeholder="Search coupon code..."
                    value={couponSearch}
                    onChange={e => setCouponSearch(e.target.value)}
                  />
                </div>
                <button className={styles.addBtn} onClick={openAddCoupon}>
                  <Plus size={16} /> New Coupon
                </button>
              </div>
            </div>

            {filteredCoupons.length === 0 ? (
              <div className={styles.empty}>
                <Tag size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: .4 }} />
                <p>{couponSearch ? 'No coupons match your search.' : 'No coupons yet. Create one!'}</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Applicable To</th>
                      <th>Min Order</th>
                      <th>Expires</th>
                      <th>Uses</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.map(c => (
                      <tr key={c.id}>
                        <td><span className={styles.couponCode}>{c.code}</span></td>
                        <td>{c.discountType === 'percentage' ? `${c.discountValue}% off` : `\u20b9${c.discountValue} off`}</td>
                        <td>
                          {c.applicability === 'all' && <span className={styles.catTag}>All Products</span>}
                          {c.applicability === 'category' && <span className={styles.catTag}>{(c.applicableCategories || []).join(', ') || 'No category'}</span>}
                          {c.applicability === 'products' && <span className={styles.catTag}>{(c.applicableProductIds || []).length} product{(c.applicableProductIds || []).length !== 1 ? 's' : ''}</span>}
                        </td>
                        <td>{c.minOrderAmount > 0 ? `\u20b9${c.minOrderAmount}` : '\u2014'}</td>
                        <td style={{ fontSize: '.82rem' }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '\u2014'}</td>
                        <td style={{ fontSize: '.82rem' }}>{c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                        <td>
                          <button
                            className={c.isActive ? styles.badgeTag : styles.catTag}
                            style={c.isActive
                              ? { cursor: 'pointer', background: '#d1fae5', color: '#065f46', border: 'none' }
                              : { cursor: 'pointer', background: '#fee2e2', color: '#991b1b', border: 'none' }}
                            onClick={() => toggleCouponActive(c)}
                            title="Click to toggle"
                          >
                            {c.isActive ? '\u2705 Active' : '\u274c Disabled'}
                          </button>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button className={styles.editBtn} onClick={() => openEditCoupon(c)}><Pencil size={14} /></button>
                            <button className={styles.deleteBtn} onClick={() => setDelCouponConfirm(c.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SUBSCRIBERS ── */}
        {tab === 'subscribers' && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>\ud83d\udce7 Subscribers ({filteredSubscribers.length})</h1>
              <div className={styles.searchBox}>
                <Search size={15}/>
                <input
                  className={styles.searchInput}
                  placeholder="Search by email..."
                  value={subSearch}
                  onChange={e => setSubSearch(e.target.value)}
                />
              </div>
            </div>

            {subLoading ? (
              <div className={styles.loading}>Loading subscribers...</div>
            ) : filteredSubscribers.length === 0 ? (
              <div className={styles.empty}>
                <Mail size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: .4 }} />
                <p>{subSearch ? 'No subscribers match your search.' : 'No subscribers yet.'}</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>#</th><th>Email</th><th>Subscribed On</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredSubscribers.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--earth)', fontSize: '.8rem' }}>{i + 1}</td>
                        <td><a href={`mailto:${s.email}`} className={styles.emailLink}>\ud83d\udce7 {s.email}</a></td>
                        <td style={{ fontSize: '.82rem', color: 'var(--earth)' }}>
                          {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '\u2014'}
                        </td>
                        <td>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteSubscriber(s.id)} title="Remove subscriber">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── ADD/EDIT PRODUCT FORM MODAL ── */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Crimson Floral Bedsheet" />
                </div>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="bedsheet">Bed Sheet</option>
                    <option value="kids">Kids Wear</option>
                    <option value="women">Women Wear</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Price (\u20b9) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1299" />
                </div>
                <div className={styles.formGroup}>
                  <label>Old Price (\u20b9)</label>
                  <input type="number" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} placeholder="1699 (optional)" />
                </div>
                <div className={styles.formGroup}>
                  <label>Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="50" />
                </div>
                <div className={styles.formGroup}>
                  <label>Badge</label>
                  <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="BESTSELLER / HOT / NEW" />
                </div>
                <div className={styles.formGroup}>
                  <label>Rating</label>
                  <input type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label>Review Count</label>
                  <input type="number" value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))} placeholder="124" />
                </div>

                {/* ── MULTI-IMAGE SECTION ── */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>
                    Product Images *
                    <span className={styles.imgCountBadge}>{formImages.length} added · first = primary</span>
                  </label>

                  {/* Upload + URL row */}
                  <div className={styles.imageUploadRow}>
                    <input
                      value={urlDraft}
                      onChange={e => setUrlDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                      placeholder="Paste image URL and press Enter or Add"
                      className={styles.imageUrlInput}
                      ref={urlInputRef}
                    />
                    <button type="button" className={styles.addUrlBtn} onClick={handleAddUrl} disabled={!urlDraft.trim()}>
                      + Add
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className={styles.uploadBtn}
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploading}
                    >
                      {uploading
                        ? <><span className={styles.spinner} /> Uploading...</>
                        : <><ImagePlus size={15} /> Upload</>
                      }
                    </button>
                  </div>

                  {/* Gallery grid */}
                  {formImages.length > 0 && (
                    <div className={styles.imgGallery}>
                      {formImages.map((url, idx) => (
                        <div
                          key={idx}
                          className={`${styles.imgGalleryItem} ${idx === 0 ? styles.imgGalleryPrimary : ''}`}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => handleDrop(idx)}
                        >
                          <img src={url} alt={`product-${idx}`} />
                          {idx === 0 && <span className={styles.primaryBadge}>Primary</span>}
                          <button
                            type="button"
                            className={styles.imgRemoveBtn}
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove"
                          >
                            <X size={12} />
                          </button>
                          <div className={styles.imgDragHandle} title="Drag to reorder">
                            <GripVertical size={13} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {formImages.length === 0 && (
                    <p className={styles.imgHint}>Upload or paste URLs above. Drag thumbnails to reorder. First image is shown as the main product photo.</p>
                  )}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Sizes (comma separated)</label>
                  <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="Single, Double, King, Queen" />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Colors (comma separated hex)</label>
                  <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} placeholder="#8B0000, #0A1172, #000000" />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Product description..." />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><Check size={16} /> {editId ? 'Update Product' : 'Add Product'}</> }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD/EDIT COUPON FORM MODAL ── */}
      {showCouponForm && (
        <div className={styles.modalOverlay} onClick={() => setShowCouponForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className={styles.modalHeader}>
              <h2>{couponEditId ? '\u270f\ufe0f Edit Coupon' : '\ud83c\udff7\ufe0f New Coupon'}</h2>
              <button className={styles.modalClose} onClick={() => setShowCouponForm(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Coupon Code *</label>
                  <input value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. NEEMROZ20" style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }} />
                </div>
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label>Status</label>
                  <button type="button" onClick={() => setCouponForm(f => ({ ...f, isActive: !f.isActive }))} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, background: couponForm.isActive ? '#d1fae5' : '#fee2e2', color: couponForm.isActive ? '#065f46' : '#991b1b' }}>
                    {couponForm.isActive ? '\u2705 Active' : '\u274c Disabled'}
                  </button>
                </div>
                <div className={styles.formGroup}>
                  <label>Discount Type *</label>
                  <select value={couponForm.discountType} onChange={e => setCouponForm(f => ({ ...f, discountType: e.target.value }))}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (\u20b9)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Discount Value * {couponForm.discountType === 'percentage' ? '(%)' : '(\u20b9)'}</label>
                  <input type="number" value={couponForm.discountValue} onChange={e => setCouponForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={couponForm.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 150'} min="1" max={couponForm.discountType === 'percentage' ? 100 : undefined} />
                </div>
                <div className={styles.formGroup}>
                  <label>Min Order Amount (\u20b9)</label>
                  <input type="number" value={couponForm.minOrderAmount} onChange={e => setCouponForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="e.g. 500 (optional)" />
                </div>
                <div className={styles.formGroup}>
                  <label>Max Uses (optional)</label>
                  <input type="number" value={couponForm.maxUses} onChange={e => setCouponForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="e.g. 100 (leave blank = unlimited)" />
                </div>
                <div className={styles.formGroup}>
                  <label>Expiry Date (optional)</label>
                  <input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>\ud83c\udfaf Applicable To *</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                    {[{ val: 'all', label: '\ud83d\udce6 All Products' }, { val: 'category', label: '\ud83c\udff7\ufe0f By Category' }, { val: 'products', label: '\ud83d\udd0d Specific Products' }].map(opt => (
                      <button key={opt.val} type="button" onClick={() => setCouponForm(f => ({ ...f, applicability: opt.val }))} style={{ padding: '7px 14px', borderRadius: 6, border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '.85rem', borderColor: couponForm.applicability === opt.val ? '#8B0000' : '#ddd', background: couponForm.applicability === opt.val ? '#fff0f0' : '#fff', color: couponForm.applicability === opt.val ? '#8B0000' : '#555' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {couponForm.applicability === 'category' && (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Select Categories</label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                      {ALL_CATEGORIES.map(cat => (
                        <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{ padding: '6px 14px', borderRadius: 20, border: '2px solid', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize', fontSize: '.85rem', borderColor: couponForm.applicableCategories.includes(cat) ? '#8B0000' : '#ddd', background: couponForm.applicableCategories.includes(cat) ? '#fff0f0' : '#f9f9f9', color: couponForm.applicableCategories.includes(cat) ? '#8B0000' : '#555' }}>
                          {couponForm.applicableCategories.includes(cat) ? '\u2713 ' : ''}{cat === 'bedsheet' ? 'Bed Sheet' : cat === 'kids' ? 'Kids Wear' : 'Women Wear'}
                        </button>
                      ))}
                    </div>
                    {couponForm.applicableCategories.length === 0 && <p style={{ fontSize: '.8rem', color: '#e53e3e', marginTop: 6 }}>Please select at least one category.</p>}
                  </div>
                )}
                {couponForm.applicability === 'products' && (
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Select Products <span style={{ fontWeight: 400, color: '#888', marginLeft: 8 }}>({couponForm.applicableProductIds.length} selected)</span></label>
                    <div className={styles.searchBox} style={{ marginTop: 8, marginBottom: 8 }}>
                      <Search size={13} />
                      <input className={styles.searchInput} placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                    </div>
                    <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
                      {modalFilteredProducts.length === 0 ? (
                        <div style={{ padding: 16, color: '#888', textAlign: 'center' }}>No products found</div>
                      ) : modalFilteredProducts.map(p => {
                        const selected = couponForm.applicableProductIds.includes(p.id)
                        return (
                          <div key={p.id} onClick={() => toggleProduct(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: selected ? '#fff0f0' : 'transparent', transition: 'background .15s' }}>
                            <div style={{ width: 18, height: 18, borderRadius: 4, border: '2px solid', borderColor: selected ? '#8B0000' : '#ccc', background: selected ? '#8B0000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {selected && <Check size={11} color="#fff" />}
                            </div>
                            <img src={p.imageUrl} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                              <div style={{ fontSize: '.78rem', color: '#888', textTransform: 'capitalize' }}>{p.category} \u00b7 \u20b9{p.price?.toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {couponForm.applicableProductIds.length === 0 && <p style={{ fontSize: '.8rem', color: '#e53e3e', marginTop: 6 }}>Please select at least one product.</p>}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowCouponForm(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveCoupon} disabled={couponSaving}>
                {couponSaving ? 'Saving...' : <><Check size={16} /> {couponEditId ? 'Update Coupon' : 'Create Coupon'}</> }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE PRODUCT CONFIRM ── */}
      {delConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDelConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <AlertTriangle size={40} color="#e53e3e" />
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.confirmBtns}>
              <button className={styles.cancelBtn} onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className={styles.deleteBtnRed} onClick={() => handleDelete(delConfirm)}><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE COUPON CONFIRM ── */}
      {delCouponConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDelCouponConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <AlertTriangle size={40} color="#e53e3e" />
            <h3>Delete Coupon?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.confirmBtns}>
              <button className={styles.cancelBtn} onClick={() => setDelCouponConfirm(null)}>Cancel</button>
              <button className={styles.deleteBtnRed} onClick={() => handleDeleteCoupon(delCouponConfirm)}><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
