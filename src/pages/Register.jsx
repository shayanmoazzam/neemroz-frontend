import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Register() {
  const [form, setForm]   = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { firstName, lastName, email, phone, password, confirm } = form
    if (!firstName||!lastName||!email||!password) { toast.error('Fill all required fields'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      await register({ firstName, lastName, email, phone, password })
      toast.success('Account created! Welcome to Neemroz 🌿')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <Link to="/" className={styles.logo}>Neem<span>roz</span></Link>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.sub}>Join the Neemroz family today</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>First Name *</label>
              <input value={form.firstName} onChange={e => set('firstName',e.target.value)} placeholder="Shayan" />
            </div>
            <div className={styles.field}>
              <label>Last Name *</label>
              <input value={form.lastName} onChange={e => set('lastName',e.target.value)} placeholder="Khan" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Email Address *</label>
            <input type="email" value={form.email} onChange={e => set('email',e.target.value)} placeholder="you@email.com" />
          </div>
          <div className={styles.field}>
            <label>Phone Number</label>
            <input value={form.phone} onChange={e => set('phone',e.target.value)} placeholder="9876543210" maxLength={10} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Password *</label>
              <input type="password" value={form.password} onChange={e => set('password',e.target.value)} placeholder="Min. 6 characters" />
            </div>
            <div className={styles.field}>
              <label>Confirm Password *</label>
              <input type="password" value={form.confirm} onChange={e => set('confirm',e.target.value)} placeholder="Repeat password" />
            </div>
          </div>
          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className={styles.imgPanel}>
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80" alt="linen" />
        <div className={styles.imgOverlay} />
        <div className={styles.imgText}>
          <div className={styles.imgQuote}>"Softness you can feel, quality you can trust"</div>
          <div className={styles.imgSub}>— Neemroz, Premium Home Linen</div>
        </div>
      </div>
    </div>
  )
}
