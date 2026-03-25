import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search, X } from 'lucide-react'
import api from '../api'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import styles from './Shop.module.css'

const CATEGORIES = [
  { key: 'all',      label: 'All',        emoji: '🛍️' },
  { key: 'bedsheet', label: 'Bed Sheets', emoji: '🛏️' },
  { key: 'kids',     label: 'Kids',       emoji: '👗' },
  { key: 'women',    label: 'Women',      emoji: '✨' },
]

const SORT_OPTIONS = [
  { key: 'default',    label: 'Default' },
  { key: 'price_asc',  label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'rating',     label: 'Top Rated' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]   = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [sort, setSort]           = useState('default')
  const [priceMax, setPriceMax]   = useState(10000)
  const [showFilters, setShowFilters] = useState(false)

  const category = searchParams.get('category') || 'all'
  const search   = searchParams.get('search') || ''

  useEffect(() => {
    setLoading(true)
    api.get('/products').then(r => {
      setProducts(r.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = [...products]
    if (category !== 'all') result = result.filter(p => p.category === category)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      )
    }
    result = result.filter(p => p.price <= priceMax)
    if (sort === 'price_asc')  result.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
    if (sort === 'rating')     result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    setFiltered(result)
  }, [products, category, search, sort, priceMax])

  const setCategory = (key) => {
    const params = new URLSearchParams(searchParams)
    if (key === 'all') params.delete('category')
    else params.set('category', key)
    params.delete('search')
    setSearchParams(params)
  }

  const getCategoryTitle = () => {
    if (search) return `Results for "${search}"`
    if (category === 'all') return 'All Products'
    return CATEGORIES.find(c => c.key === category)?.label || 'Products'
  }

  return (
    <div className={styles.page}>

      {/* Filter chips — mobile only */}
      <div className={styles.chipBar}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className={`${styles.chip} ${category === c.key ? styles.chipActive : ''}`}
            onClick={() => setCategory(c.key)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
        <div className={styles.chipDivider} />
        <select
          className={styles.chipSort}
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{getCategoryTitle()}</h1>
          <p className={styles.subtitle}>{filtered.length} products found</p>
        </div>
        <div className={styles.headerRight}>
          <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <button className={styles.filterToggle} onClick={() => setShowFilters(s => !s)}>
            <SlidersHorizontal size={16} />Filters
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHead}>
            <span>Filters</span>
            <button onClick={() => setShowFilters(false)} className={styles.closeSidebar}><X size={18} /></button>
          </div>
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Category</div>
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                className={`${styles.catBtn} ${category === c.key ? styles.catBtnActive : ''}`}
                onClick={() => setCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Max Price: ₹{priceMax.toLocaleString('en-IN')}</div>
            <input type="range" min={299} max={10000} step={100} value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))} className={styles.rangeInput}/>
            <div className={styles.rangeLabels}><span>₹299</span><span>₹10,000</span></div>
          </div>
          <button className={styles.resetBtn}
            onClick={() => { setSort('default'); setPriceMax(10000); setCategory('all') }}>
            Reset All Filters
          </button>
        </aside>

        <main className={styles.main}>
          {loading ? (
            <div className={styles.grid}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <Search size={48} strokeWidth={1} />
              <p>No products found</p>
              <small>Try adjusting your filters or search term</small>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
