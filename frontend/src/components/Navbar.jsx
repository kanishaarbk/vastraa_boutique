import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount } = useCart();

  const closeMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Sarees', path: '/shop?category=Sarees' },
    { name: 'Salwar Sets', path: '/shop?category=Salwar Sets' },
    { name: 'Anarkali', path: '/shop?category=Anarkali' },
    { name: 'Kurtas', path: '/shop?category=Kurtas' },
    { name: 'Lehengas', path: '/shop?category=Lehengas' },
    { name: 'Festive Wear', path: '/shop?category=Festive Wear' },
  ];

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
                  <NavLink
                    to={item.path}
                    className="nav-link"
                    onClick={closeMenu}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            <Link
              to="/cart"
              className="cart-button"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={21} strokeWidth={1.8} />

              {totalItemsCount > 0 && (
                <span className="cart-count">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={
                mobileMenuOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }
            >
              {mobileMenuOpen ? (
                <X size={25} />
              ) : (
                <Menu size={25} />
              )}
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

          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              {item.name}
            </Link>
          ))}

          <Link
            to="/cart"
            className="mobile-nav-link mobile-cart-link"
            onClick={closeMenu}
          >
            <ShoppingBag size={18} />
            Cart
            {totalItemsCount > 0 && ` (${totalItemsCount})`}
          </Link>
        </div>
      )}
    </header>
  );
}