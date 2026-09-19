import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Crown,
} from 'lucide-react';

import { api } from '../services/api';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const [catData, prodData] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true }),
        ]);

        setCategories(catData);
        setFeaturedProducts(prodData);
      } catch (err) {
        setError(err.message || 'Failed to load boutique collection');
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="home-page">

      {/* ================= HERO ================= */}
      <section className="hero boutique-hero">
        <div className="container">
          <div className="hero-grid">

            <div className="hero-content">

              <div className="hero-tag">
                <Sparkles size={15} />
                Curated Indian Ethnic Wear
              </div>

              <h1 className="hero-title">
                Timeless Elegance,
                <br />
                <em>Woven for You.</em>
              </h1>

              <p className="hero-subtitle">
                Discover graceful sarees, elegant salwar sets and
                beautiful ethnic wear thoughtfully chosen for every
                celebration and every special moment.
              </p>

              <div className="hero-actions">
                <Link to="/shop" className="btn btn-primary btn-lg">
                  Explore Collection
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#featured-categories"
                  className="btn btn-secondary btn-lg"
                >
                  Browse Categories
                </a>
              </div>

              {/* Small trust points */}
              <div className="hero-features">
                <div className="hero-feature">
                  <Crown size={17} />
                  <span>Curated Styles</span>
                </div>

                <div className="hero-feature">
                  <Heart size={17} />
                  <span>Made for Every Occasion</span>
                </div>
              </div>

            </div>

            {/* Hero Image */}
            <div className="hero-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85"
                alt="Elegant Indian ethnic fashion"
                className="hero-img"
              />

              <div className="hero-badge-overlay">
                <div className="hero-badge-title">
                  Elegance in Every Thread
                </div>

                <div className="hero-badge-desc">
                  Beautiful ethnic wear for your beautiful moments
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= INTRO ================= */}
      <section className="boutique-intro">
        <div className="container">
          <div className="boutique-intro-content">

            <span className="eyebrow">
              HERITAGE &amp; CO.
            </span>

            <h2>
              Where Tradition Meets
              <em> Modern Grace</em>
            </h2>

            <p>
              From timeless sarees to contemporary ethnic sets,
              discover pieces that celebrate Indian craftsmanship
              while fitting beautifully into your modern wardrobe.
            </p>

          </div>
        </div>
      </section>


      {/* ================= CATEGORIES ================= */}
      <section
        id="featured-categories"
        className="section boutique-categories"
      >
        <div className="container">

          <div className="section-header">
            <span className="eyebrow">
              SHOP BY STYLE
            </span>

            <h2 className="section-title">
              Explore Our Collections
            </h2>

            <p className="section-subtitle">
              Find the perfect ensemble for everyday elegance,
              festive celebrations and unforgettable occasions.
            </p>
          </div>

          <div className="category-cards-grid">

            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(
                  cat.slug || cat.id
                )}`}
                className="category-card"
              >

                <div className="category-card-content">
                  <span className="category-card-small">
                    COLLECTION
                  </span>

                  <h3 className="category-card-name">
                    {cat.name}
                  </h3>

                  {cat.description && (
                    <p className="category-card-desc">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="category-card-action">
                  <span>Explore Collection</span>
                  <ArrowRight size={15} />
                </div>

              </Link>
            ))}

          </div>

        </div>
      </section>


      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="section boutique-products">
        <div className="container">

          <div className="section-header section-header-flex">

            <div>
              <span className="eyebrow">
                OUR EDIT
              </span>

              <h2 className="section-title">
                Curated For You
              </h2>

              <p className="section-subtitle">
                A selection of pieces we think you'll love.
              </p>
            </div>

            <Link
              to="/shop"
              className="btn btn-secondary btn-sm"
            >
              View All
              <ArrowRight size={14} />
            </Link>

          </div>

          {loading ? (
            <LoadingSpinner message="Curating your collection..." />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <ProductGrid
              products={featuredProducts.slice(0, 8)}
              emptyTitle="Collection coming soon"
              emptyDescription="Beautiful pieces are being added to our collection."
            />
          )}

        </div>
      </section>


      {/* ================= OCCASION BANNER ================= */}
      <section className="occasion-banner">
        <div className="container">

          <div className="occasion-banner-content">

            <span className="eyebrow">
              FOR YOUR SPECIAL MOMENTS
            </span>

            <h2>
              Dress for the
              <em> moments worth remembering.</em>
            </h2>

            <p>
              From festive gatherings to intimate celebrations,
              find an outfit that feels uniquely yours.
            </p>

            <Link
              to="/shop"
              className="btn btn-primary"
            >
              Discover More
              <ArrowRight size={17} />
            </Link>

          </div>

        </div>
      </section>

    </div>
  );
}