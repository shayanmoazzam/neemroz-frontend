import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Navbar from './components/Navbar'
import CartSidebar from './components/CartSidebar'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import ProductDetail from './pages/ProductDetail'
import Wishlist from './pages/Wishlist'
import Admin from './pages/Admin'
import FAQs from './pages/FAQs'
import ShippingInfo from './pages/ShippingInfo'
import ReturnsRefunds from './pages/ReturnsRefunds'
import SizeGuide from './pages/SizeGuide'
import TrackOrder from './pages/TrackOrder'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
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
            <ScrollToTop />
            <Routes>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/"                element={<Home />} />
                    <Route path="/shop"            element={<Shop />} />
                    <Route path="/product/:id"     element={<ProductDetail />} />
                    <Route path="/checkout"        element={<Checkout />} />
                    <Route path="/orders"          element={<Orders />} />
                    <Route path="/wishlist"        element={<Wishlist />} />
                    <Route path="/admin"           element={<Admin />} />
                    <Route path="/faqs"            element={<FAQs />} />
                    <Route path="/shipping-info"   element={<ShippingInfo />} />
                    <Route path="/returns-refunds" element={<ReturnsRefunds />} />
                    <Route path="/size-guide"      element={<SizeGuide />} />
                    <Route path="/track-order"     element={<TrackOrder />} />
                  </Routes>
                  <Footer />
                </>
              } />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
