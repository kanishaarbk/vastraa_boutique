import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyAccountPage from './pages/MyAccountPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import EmptyState from './components/EmptyState';
import './App.css';

function ScrollToTop() {
  const { pathname } = window.location;
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Catalog & Shop */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer Account Routes (Protected) */}
                <Route
                  path="/my-account"
                  element={
                    <ProtectedRoute>
                      <MyAccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/orders/:id" element={<OrderDetailPage />} />

                {/* 404 Route */}
                <Route
                  path="*"
                  element={
                    <div className="container" style={{ padding: '5rem 1.25rem' }}>
                      <EmptyState
                        title="Page Not Found"
                        description="The page you are looking for does not exist or has moved."
                        actionText="Back to Home"
                        actionLink="/"
                      />
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
