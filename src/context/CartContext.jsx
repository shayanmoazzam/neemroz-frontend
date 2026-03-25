import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api'
import { useAuth } from './AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [cartItems, setCartItems] = useState([])
  const [cartOpen, setCartOpen]   = useState(false)
  const [loading, setLoading]     = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); return }
    try {
      const res = await api.get('/cart')
      setCartItems(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.error('Failed to fetch cart', e)
      setCartItems([])
    }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const requireLogin = () => {
    toast('Please login to continue', {
      icon: '🔐',
      duration: 2500,
    })
    // Save current path so we redirect back after login
    const currentPath = location.pathname + location.search
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  const addToCart = async (productId, quantity = 1, size = '', color = '') => {
    if (!user) { requireLogin(); return }
    setLoading(true)
    try {
      await api.post('/cart/add', { productId, quantity, size, color })
      await fetchCart()
      setCartOpen(true)
      toast.success('Added to cart!')
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || ''
      if (e.response?.status === 401) {
        requireLogin()
      } else if (typeof msg === 'string' && msg.toLowerCase().includes('stock')) {
        toast.error('Sorry, product is out of stock!')
      } else {
        toast.error('Failed to add to cart. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await api.put(`/cart/update/${cartItemId}`, { quantity })
      await fetchCart()
    } catch (e) {
      toast.error('Failed to update quantity')
    }
  }

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/remove/${cartItemId}`)
      await fetchCart()
      toast.success('Item removed')
    } catch (e) {
      toast.error('Failed to remove item')
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear')
      setCartItems([])
    } catch (e) { console.error(e) }
  }

  const safeCart   = Array.isArray(cartItems) ? cartItems : []
  const cartCount  = safeCart.reduce((s, i) => s + (i.quantity || 0), 0)
  const cartTotal  = safeCart.reduce((s, i) => s + ((i.product?.price || 0) * (i.quantity || 0)), 0)
  const shipping   = cartTotal >= 799 ? 0 : 49
  const grandTotal = cartTotal + shipping

  return (
    <CartContext.Provider value={{
      cartItems: safeCart, cartCount, cartTotal, shipping, grandTotal,
      cartOpen, setCartOpen,
      addToCart, updateQuantity, removeFromCart, clearCart,
      fetchCart, loading
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
