import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function Footer() {
  return (
    <>
      {/* =========================================
          TRUST PILLARS
          ========================================= */}
      <section className="trust-pillars">
        <div className="container">
          <div className="pillars-grid">

            <div className="pillar-item">
              <div className="pillar-icon">
                <Truck size={22} />
              </div>

              <div>
                <h4 className="pillar-title">
                  Easy Delivery
                </h4>

                <p className="pillar-desc">
                  Convenient delivery right to your doorstep.
                </p>
              </div>
            </div>


            <div className="pillar-item">
              <div className="pillar-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h4 className="pillar-title">
                  Secure Payments
                </h4>

                <p className="pillar-desc">
                  Pay safely with UPI, cards and other secure options.
                </p>
              </div>
            </div>


            <div className="pillar-item">
              <div className="pillar-icon">
                <Sparkles size={22} />
              </div>

              <div>
                <h4 className="pillar-title">
                  Curated Styles
                </h4>

                <p className="pillar-desc">
                  Beautiful ethnic wear selected for every occasion.
                </p>
              </div>
            </div>


            <div className="pillar-item">
              <div className="pillar-icon">
                <Clock size={22} />
              </div>

              <div>
                <h4 className="pillar-title">
                  Personal Service
                </h4>

                <p className="pillar-desc">
                  Friendly support whenever you need help with your order.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================
          MAIN FOOTER
          ========================================= */}
      <footer className="footer">
        <div className="container">

          <div className="footer-grid">

            {/* Brand */}
            <div>
              <Link
                to="/"
                className="brand-logo"
              >
                <span>Vastraa Boutique</span>
              </Link>

              <p className="footer-brand-desc">
                Discover timeless Indian elegance with our
                collection of sarees, salwar sets, kurtis
                and beautiful ethnic styles for every occasion.
              </p>
            </div>


            {/* Explore */}
            <div>
              <h4 className="footer-col-title">
                Explore
              </h4>

              <ul className="footer-links">

                <li>
                  <Link
                    to="/"
                    className="footer-link"
                  >
                    Home
                  </Link>
                </li>

                <li>
                  <Link
                    to="/shop"
                    className="footer-link"
                  >
                    Our Collection
                  </Link>
                </li>

                <li>
                  <Link
                    to="/cart"
                    className="footer-link"
                  >
                    Shopping Bag
                  </Link>
                </li>

              </ul>
            </div>


            {/* Categories */}
            <div>
              <h4 className="footer-col-title">
                Collections
              </h4>

              <ul className="footer-links">

                <li>
                  <Link
                    to="/shop?category=sarees"
                    className="footer-link"
                  >
                    Sarees
                  </Link>
                </li>

                <li>
                  <Link
                    to="/shop?category=salwar-sets"
                    className="footer-link"
                  >
                    Salwar Sets
                  </Link>
                </li>

                <li>
                  <Link
                    to="/shop?category=kurtis"
                    className="footer-link"
                  >
                    Kurtis
                  </Link>
                </li>

                <li>
                  <Link
                    to="/shop?category=dupattas"
                    className="footer-link"
                  >
                    Dupattas
                  </Link>
                </li>

              </ul>
            </div>


            {/* Contact */}
            <div>
              <h4 className="footer-col-title">
                Visit Us
              </h4>

              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: '1.8',
                }}
              >
                Vastraa Boutique
                <br />

                Your destination for Indian ethnic wear
                <br />

                Mon–Sat: 10:00 AM – 8:00 PM
                <br />

                support@vastraaboutique.com
              </p>
            </div>

          </div>


          {/* Footer Bottom */}
          <div className="footer-bottom">

            <p>
              &copy; {new Date().getFullYear()} Vastraa Boutique.
              All rights reserved.
            </p>

            <p>
              Crafted with Django REST Framework &amp; React
            </p>

          </div>

        </div>
      </footer>
    </>
  );
}