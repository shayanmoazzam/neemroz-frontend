import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import CartSidebar from './components/CartSidebar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#3D2B1F',
                color: '#FAF7F2',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.85rem',
                borderRadius: '50px',
                padding: '12px 20px',
              },
              success: { iconTheme: { primary: '#C4622D', secondary: '#FAF7F2' } },
            }}
          />
          <CartSidebar />
          <Routes>
            {/* Login and Register pages don't show Navbar/Footer */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/"         element={<Home />} />
                  <Route path="/shop"     element={<Shop />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders"   element={<Orders />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
