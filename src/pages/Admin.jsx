import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, ShoppingBag, Users, TrendingUp,
  Plus, Pencil, Trash2, X, Check, AlertTriangle,
  ChevronDown, ChevronUp, Search, Upload, ImagePlus, Mail
} from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Admin.module.css'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', description: '', price: '', oldPrice: '',
  category: 'bedsheet', imageUrl: '', badge: '',
  sizes: '', colors: '', stock: '', rating: '4.5', reviewCount: ''
}

const STATUS_COLORS = {
  pending:    { color: '#856404', bg: '#fff3cd' },
  processing: { color: '#0c63e4', bg: '#cfe2ff' },
  shipped:    { color: '#0a5c2e', bg: '#d1e7dd' },
  delivered:  { color: '#0a3622', bg: '#badbcc' },
  cancelled:  { color: '#842029', bg: '#f8d7da' },
}

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [tab, setTab]               = useState('dashboard')
  const [products, setProducts]     = useState([])
  const [orders, setOrders]         = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [subLoading, setSubLoading] = useState(false)
  const [subSearch, setSubSearch]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [editId, setEditId]         = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [delConfirm, setDelConfirm] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [search, setSearch]         = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user || user.role?.toUpperCase() !== 'ADMIN') navigate('/')
  }, [user])

  const loadData = () => {
    Promise.all([
      api.get('/products'),
      api.get('/orders/all').catch(() => api.get('/orders')),
      api.get('/newsletter/subscribers').catch(() => ({ data: [] }))
    ]).then(([p, o, s]) => {
      setProducts(Array.isArray(p.data) ? p.data : [])
      setOrders(Array.isArray(o.data) ? o.data : [])
      setSubscribers(Array.isArray(s.data) ? s.data : [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  // Reload subscribers if tab opened and still empty
  useEffect(() => {
    if (tab === 'subscribers' && subscribers.length === 0) {
      setSubLoading(true)
      api.get('/newsletter/subscribers')
        .then(r => setSubscribers(Array.isArray(r.data) ? r.data : []))
        .catch(() => toast.error('Failed to load subscribers'))
        .finally(() => setSubLoading(false))
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(f => ({ ...f, imageUrl: res.data.url }))
      toast.success('Image uploaded!')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const stats = [
    { icon: <Package size={22}/>,     label: 'Total Products',  value: products.length,      color: '#8B0000' },
    { icon: <ShoppingBag size={22}/>, label: 'Total Orders',    value: orders.length,        color: '#C4622D' },
    { icon: <TrendingUp size={22}/>,  label: 'Revenue',         value: `\u20b9${orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || o.total || 0), 0).toLocaleString('en-IN')}`, color: '#2d8a4e' },
    { icon: <Mail size={22}/>,        label: 'Subscribers',     value: subscribers.length,   color: '#6B21A8' },
  ]

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (p) => {
    setForm({ ...p, sizes: p.sizes?.join(', ') || '', colors: p.colors?.join(', ') || '', oldPrice: p.oldPrice || '' })
    setEditId(p.id); setShowForm(true)
  }
  const handleSave = async () => {
    if (!form.name || !form.price || !form.imageUrl) return
    setSaving(true)
    const payload = {
      ...form,
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

  if (loading) return <div className={styles.loading}>Loading admin panel...</div>

  return (
    <div className={styles.page}>

      <button className={styles.menuToggle} onClick={() => setSidebarOpen(o => !o)}>☰ Menu</button>

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>⚙️ Admin Panel</div>
        <nav className={styles.sideNav}>
          {[
            { key: 'dashboard',   label: '📊 Dashboard' },
            { key: 'products',    label: '📦 Products' },
            { key: 'orders',      label: '🛒 Orders' },
            { key: 'subscribers', label: '📧 Subscribers' },
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
        <button className={styles.sideBack} onClick={() => navigate('/')}>← Back to Site</button>
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
                        <td>{o.shippingName || `${o.firstName || ''} ${o.lastName || ''}`.trim() || '—'}</td>
                        <td>{o.items?.length || 0} items</td>
                        <td>₹{(o.totalAmount || o.total)?.toLocaleString('en-IN')}</td>
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

            {/* Desktop table */}
            <div className={`${styles.tableWrap} ${styles.desktopOnly}`}>
              <table className={styles.table}>
                <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Badge</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.imageUrl} alt={p.name} className={styles.productThumb} /></td>
                      <td className={styles.productName}>{p.name}</td>
                      <td><span className={styles.catTag}>{p.category}</span></td>
                      <td>₹{p.price?.toLocaleString('en-IN')}{p.oldPrice && <span className={styles.oldPriceTag}> ₹{p.oldPrice}</span>}</td>
                      <td><span className={p.stock <= 5 ? styles.lowStock : styles.stockOk}>{p.stock}</span></td>
                      <td>{p.badge ? <span className={styles.badgeTag}>{p.badge}</span> : '—'}</td>
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

            {/* Mobile cards */}
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
                      <span>₹{p.price?.toLocaleString('en-IN')}</span>
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
                            👤 {o.shippingName || `${o.firstName || ''} ${o.lastName || ''}`.trim() || 'Customer'}
                          </div>
                          <div className={styles.orderCardMeta}>
                            📞 {o.shippingPhone || o.phone || '—'} &nbsp;·&nbsp;
                            📅 {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className={styles.orderCardRight}>
                          <div className={styles.orderCardTotal}>₹{(o.totalAmount || o.total)?.toLocaleString('en-IN')}</div>
                          <span className={styles.statusBadge} style={{ color: cfg.color, background: cfg.bg }}>
                            {o.status || 'pending'}
                          </span>
                          {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={styles.orderCardBody}>
                          <div className={styles.orderItemsList}>
                            <div className={styles.orderSectionLabel}>📦 Items Ordered</div>
                            {o.items?.map((item, i) => (
                              <div key={i} className={styles.orderItemRow}>
                                <img
                                  src={item.imageUrl || item.product?.imageUrl}
                                  alt={item.name || item.product?.name}
                                  className={styles.orderItemImg}
                                />
                                <div className={styles.orderItemInfo}>
                                  <div className={styles.orderItemName}>{item.name || item.product?.name}</div>
                                  <div className={styles.orderItemMeta}>Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className={styles.orderAddress}>
                            <div className={styles.orderSectionLabel}>📍 Shipping Address</div>
                            <div className={styles.orderAddressText}>
                              {o.shippingAddress || o.address}, {o.shippingCity || o.city}, {o.shippingState || o.state} – {o.shippingPinCode || o.pinCode}
                            </div>
                          </div>

                          <div className={styles.orderMeta2}>
                            <div><span className={styles.metaLabel}>Payment:</span> {o.paymentMethod || '—'}</div>
                            {o.couponDiscount > 0 && <div><span className={styles.metaLabel}>Coupon Discount:</span> −₹{o.couponDiscount}</div>}
                          </div>

                          {o.status === 'cancelled' && o.cancelReason && (
                            <div className={styles.cancelNote}>
                              ❌ Cancelled by user: <em>{o.cancelReason}</em>
                            </div>
                          )}

                          <div className={styles.statusChanger}>
                            <div className={styles.orderSectionLabel}>🔄 Update Status</div>
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

        {/* ── SUBSCRIBERS ── */}
        {tab === 'subscribers' && (
          <div>
            <div className={styles.topBar}>
              <h1 className={styles.pageTitle}>📧 Subscribers ({filteredSubscribers.length})</h1>
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
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email</th>
                      <th>Subscribed On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--earth)', fontSize: '.8rem' }}>{i + 1}</td>
                        <td>
                          <a href={`mailto:${s.email}`} className={styles.emailLink}>
                            📧 {s.email}
                          </a>
                        </td>
                        <td style={{ fontSize: '.82rem', color: 'var(--earth)' }}>
                          {s.subscribedAt
                            ? new Date(s.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteSubscriber(s.id)}
                            title="Remove subscriber"
                          >
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

      {/* ── ADD/EDIT FORM MODAL ── */}
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
                  <label>Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1299" />
                </div>
                <div className={styles.formGroup}>
                  <label>Old Price (₹)</label>
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

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Product Image *</label>
                  <div className={styles.imageUploadRow}>
                    <input
                      value={form.imageUrl}
                      onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="Paste URL or upload image below"
                      className={styles.imageUrlInput}
                    />
                    <input
                      type="file"
                      accept="image/*"
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
                        : <><ImagePlus size={15} /> Upload Image</>
                      }
                    </button>
                  </div>
                  {form.imageUrl && (
                    <div className={styles.imgPreviewInline}>
                      <img src={form.imageUrl} alt="preview" />
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
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

      {/* ── DELETE CONFIRM ── */}
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
    </div>
  )
}
