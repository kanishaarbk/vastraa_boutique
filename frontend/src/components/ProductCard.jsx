import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BACKEND_URL = 'http://127.0.0.1:8000';

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find(
    (item) => item.product.id === product.id
  );

  const cartQty = cartItem ? cartItem.quantity : 0;

  const stock = Number(product.stock) || 0;

  const isOutOfStock = stock <= 0;

  const isMaxInCart =
    cartQty >= stock && !isOutOfStock;

  const getImageUrl = () => {
    if (!product.image_url) {
      return '/placeholder-product.svg';
    }

    if (product.image_url.startsWith('http')) {
      return product.image_url;
    }

    return `${BACKEND_URL}${product.image_url}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (isOutOfStock || isMaxInCart) {
      return;
    }

    const result = addToCart(product, 1);

    if (result.success) {
      setJustAdded(true);

      setTimeout(() => {
        setJustAdded(false);
      }, 1200);
    }
  };

  const formattedPrice = parseFloat(product.price || 0).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }
  );

  return (
    <div className="product-card">

      {/* PRODUCT IMAGE */}
      <Link
        to={`/products/${product.id}`}
        className="product-card-image-wrap"
      >
        <img
          src={getImageUrl()}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.svg';
          }}
        />

        {/* BADGES */}
        <div className="product-card-badges">

          {product.is_featured && (
            <span className="badge badge-primary">
              <Sparkles size={12} />
              Featured
            </span>
          )}

          {isOutOfStock ? (
            <span className="badge badge-danger">
              Sold Out
            </span>
          ) : stock <= 5 ? (
            <span className="badge badge-warning">
              Only {stock} left
            </span>
          ) : null}

        </div>
      </Link>

      {/* PRODUCT DETAILS */}
      <div className="product-card-body">

        <span className="product-card-cat">
          {product.category_name || 'Ethnic Wear'}
        </span>

        <h3 className="product-card-name">
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        <p className="product-card-desc">
          {product.description}
        </p>

        {/* PRICE + CART */}
        <div className="product-card-footer">

          <div className="product-card-price-wrap">
            <span className="product-card-price">
              ₹{formattedPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxInCart}
            className={`btn btn-sm ${
              justAdded ? 'btn-secondary' : 'btn-primary'
            }`}
            title={
              isOutOfStock
                ? 'Out of stock'
                : isMaxInCart
                ? 'Maximum available quantity already in cart'
                : 'Add to Shopping Bag'
            }
          >

            {justAdded ? (
              <>
                <Check size={14} />
                Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : isMaxInCart ? (
              'In Bag'
            ) : (
              <>
                <ShoppingBag size={14} />
                Add to Bag
              </>
            )}

          </button>

        </div>

      </div>
    </div>
  );
}