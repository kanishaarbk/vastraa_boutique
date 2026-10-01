import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Package, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { totalItemsCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Sarees', path: '/shop?category=Sarees' },
    { name: 'Salwar Sets', path: '/shop?category=Salwar Sets' },
    { name: 'Anarkali', path: '/shop?category=Anarkali' },
    { name: 'Kurtas', path: '/shop?category=Kurtas' },
    { name: 'Lehengas', path: '/shop?category=Lehengas' },
    { name: 'Festive Wear', path: '/shop?category=Festive Wear' },
  ];

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Account';

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand */}
          <Link to="/" className="brand-logo" onClick={closeMenu}>
            <span className="brand-name">Heritage &amp; Co.</span>
            <span className="brand-badge">ETHNIC BOUTIQUE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-navigation">
            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink to={item.path} className="nav-link" onClick={closeMenu}>
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Shopping Cart */}
            <Link to="/cart" className="cart-button" aria-label="Shopping Cart" onClick={closeMenu}>
              <ShoppingBag size={21} strokeWidth={1.8} />
              {totalItemsCount > 0 && <span className="cart-count">{totalItemsCount}</span>}
            </Link>

            {/* Customer Auth Actions (Desktop) */}
            <div className="desktop-auth-actions" style={{ position: 'relative' }}>
              {isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={{
                      background: 'var(--color-primary-subtle)',
                      border: '1px solid var(--color-primary-border)',
                      color: 'var(--color-primary)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'var(--transition)',
                    }}
                  >
                    <User size={16} />
                    <span>Hi, {firstName}</span>
                  </button>

                  {/* Account Dropdown */}
                  {userDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: '200px',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: '0.5rem 0',
                        zIndex: 100,
                      }}
                    >
                      <Link
                        to="/my-account"
                        onClick={closeMenu}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--color-text-main)',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <User size={16} />
                        My Account
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={closeMenu}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--color-text-main)',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <Package size={16} />
                        My Orders
                      </Link>

                      <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.3rem 0' }} />

                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          logout();
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--color-danger)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link
                    to="/login"
                    className="nav-link"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      padding: '0.4rem 0.75rem',
                    }}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.825rem',
                      padding: '0.4rem 0.9rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <div className="mobile-menu-brand">
            <span>Heritage &amp; Co.</span>
            <small>ETHNIC BOUTIQUE</small>
          </div>

          {/* User Header in Mobile Drawer */}
          {isAuthenticated ? (
            <div
              style={{
                padding: '0.85rem 1.25rem',
                margin: '0 0 0.5rem 0',
                background: 'var(--color-primary-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              Logged in as {user?.full_name || user?.email}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem 0.75rem 1rem' }}>
              <Link to="/login" className="btn btn-outline" onClick={closeMenu} style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}>
                <LogIn size={15} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu} style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}>
                <UserPlus size={15} /> Register
              </Link>
            </div>
          )}

          {navItems.map((item) => (
            <Link key={item.name} to={item.path} className="mobile-nav-link" onClick={closeMenu}>
              {item.name}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <Link to="/my-account" className="mobile-nav-link" onClick={closeMenu}>
                <User size={18} />
                My Account
              </Link>

              <Link to="/my-orders" className="mobile-nav-link" onClick={closeMenu}>
                <Package size={18} />
                My Orders
              </Link>

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="mobile-nav-link"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-danger)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}

          <Link to="/cart" className="mobile-nav-link mobile-cart-link" onClick={closeMenu}>
            <ShoppingBag size={18} />
            Cart
            {totalItemsCount > 0 && ` (${totalItemsCount})`}
          </Link>
        </div>
      )}
    </header>
  );
}