import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedCategory = searchParams.get('category') || '';

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const catData = await api.getCategories();
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }

    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    let isCancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const params = {};

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        if (sortOrder) {
          params.ordering = sortOrder;
        }

        const data = await api.getProducts(params);

        if (!isCancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Failed to load products');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      loadProducts();
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory, sortOrder]);

  // Category selection
  const handleCategorySelect = (categorySlug) => {
    if (categorySlug) {
      setSearchParams({
        category: categorySlug,
      });
    } else {
      setSearchParams({});
    }
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSortOrder('');
    setSearchParams({});
  };

  return (
    <div className="section shop-page">
      <div className="container">

        {/* Page Header */}
        <div className="section-header shop-header">
          <span className="eyebrow">HERITAGE &amp; CO. COLLECTION</span>

          <h1 className="section-title">
            Discover Your <em>Timeless Style</em>
          </h1>

          <p className="section-subtitle">
            Explore our curated collection of elegant Indian ethnic wear,
            crafted for celebrations, traditions and everyday elegance.
          </p>
        </div>

        {/* Category Filters */}
        <div className="category-filter-wrapper">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* Search & Sort */}
        <div className="shop-controls">

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search sarees, salwar sets, kurtas..."
          />

          <div className="sort-wrapper">
            <label htmlFor="sort-select">
              Sort by
            </label>

            <select
              id="sort-select"
              className="sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">Featured</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="-created_at">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <div className="active-filters">

            <span>
              Showing{' '}
              {searchQuery && (
                <>
                  results for <strong>"{searchQuery}"</strong>
                </>
              )}

              {searchQuery && selectedCategory && ' · '}

              {selectedCategory && (
                <>
                  Category: <strong>{selectedCategory}</strong>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={handleResetFilters}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <LoadingSpinner message="Curating your collection..." />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={() => {
              setSearchQuery((query) => query);
            }}
          />
        ) : (
          <ProductGrid
            products={products}
            emptyTitle="No pieces found"
            emptyDescription="We couldn't find anything matching your selection. Try another category or search term."
            onResetFilters={handleResetFilters}
          />
        )}

      </div>
    </div>
  );
}