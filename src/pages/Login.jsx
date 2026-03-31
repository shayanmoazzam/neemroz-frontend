import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      const redirect = searchParams.get('redirect')
      navigate(redirect ? redirect : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.box}>

        {/* ── Back to Home ── */}
        <Link to="/" className={styles.backHome}>
          <ArrowLeft size={15} />
          Back to Home
        </Link>

        <Link to="/" className={styles.logo}>Ayezu <span>Collection</span></Link>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.sub}>Sign in to your Ayezu Collection account</p>

        {searchParams.get('redirect') && (
          <div className={styles.loginPrompt}>
            🔐 Please login to continue
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.switchText}>
          New to Ayezu Collection? <Link to="/register">Create account</Link>
        </p>

        {/* ── Browse without logging in ── */}
        <div className={styles.browseGuest}>
          <span>Just browsing?</span>
          <Link to="/shop" className={styles.browseBtn}>
            <ShoppingBag size={14} />
            View Products
          </Link>
        </div>

      </div>

      <div className={styles.imgPanel}>
        <img src="https://www.ayezu.com/images/products/new-21.jpg" alt="collection" />
        <div className={styles.imgOverlay} />
        <div className={styles.imgText}>
          <div className={styles.imgQuote}>&ldquo;Where every night feels like luxury&rdquo;</div>
          <div className={styles.imgSub}>&mdash; Ayezu Collection, Premium Home Linen</div>
        </div>
      </div>
    </div>
  )
}
