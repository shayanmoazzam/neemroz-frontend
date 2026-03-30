import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  useEffect(() => {
    try {
      const token = sessionStorage.getItem('token')
      if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } catch {}
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    try {
      sessionStorage.setItem('token', res.data.token)
      sessionStorage.setItem('user', JSON.stringify(res.data))
    } catch {}
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data)
    return res.data
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    try {
      sessionStorage.setItem('token', res.data.token)
      sessionStorage.setItem('user', JSON.stringify(res.data))
    } catch {}
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    setUser(res.data)
    return res.data
  }

  const logout = () => {
    try {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    } catch {}
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
