import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import QuantitySelector from '../components/QuantitySelector';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, items } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedNotice, setAddedNotice] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        const data = await api.getProduct(id);

        setProduct(data);
        setQuantity(1);
      } catch (err) {
        setError(err.message || 'Style not found');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  /* Loading */
  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <LoadingSpinner message="Loading your style..." />
      </div>
    );
  }

  /* Error */
  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem' }}>
        <ErrorMessage message={error || 'Style not found'} />

        <Link
          to="/shop"
          className="btn btn-secondary"
          style={{ marginTop: '1rem' }}
        >
          <ArrowLeft size={16} />
          Back to Collection
        </Link>
      </div>
    );
  }

  /* Cart / Stock calculations */
  const cartItem = items.find(
    (item) => item.product.id === product.id
  );

  const cartQty = cartItem ? cartItem.quantity : 0;

  const remainingStock = Math.max(
    0,
    product.stock - cartQty
  );

  const isOutOfStock = product.stock <= 0;

  const isMaxInCart =
    remainingStock === 0 && !isOutOfStock;

  /* Add to Cart */
  const handleAddToCart = () => {
    if (isOutOfStock || isMaxInCart) return;

    const res = addToCart(product, quantity);

    if (res.success) {
      setAddedNotice(
        `Added ${res.addedQty} item${
          res.addedQty > 1 ? 's' : ''
        } to your bag!`
      );

      setTimeout(() => {
        setAddedNotice(null);
      }, 2500);

      setQuantity(1);
    }
  };

  const formattedPrice = parseFloat(
    product.price
  ).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <div
      className="container"
      style={{ padding: '2.5rem 1.25rem' }}
    >
      {/* Breadcrumb */}
      <nav
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to="/shop"
          style={{
            color: 'var(--color-text-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <ArrowLeft size={14} />
          Collection
        </Link>

        <span style={{ color: 'var(--color-border)' }}>
          /
        </span>

        <span
          style={{
            color: 'var(--color-text-muted)',
          }}
        >
          {product.category_name || 'Ethnic Wear'}
        </span>

        <span style={{ color: 'var(--color-border)' }}>
          /
        </span>

        <span
          style={{
            color: 'var(--color-text-main)',
            fontWeight: 600,
          }}
        >
          {product.name}
        </span>
      </nav>

      {/* Product */}
      <div className="product-detail-grid">

        {/* Product Image */}
        <div className="detail-image-box">
          <img
            src={
              product.image_url ||
              '/placeholder-product.svg'
            }
            alt={product.name}
            className="detail-image"
            onError={(e) => {
              e.currentTarget.src =
                '/placeholder-product.svg';
            }}
          />
        </div>

        {/* Product Information */}
        <div className="detail-info">

          {/* Category */}
          <span className="detail-category">
            {product.category_name || 'Ethnic Wear'}
          </span>

          {/* Title */}
          <h1 className="detail-title">
            {product.name}
          </h1>

          {/* Price */}
          <div className="detail-price-row">
            <span className="detail-price">
              ₹{formattedPrice}
            </span>

            {isOutOfStock ? (
              <span className="badge badge-danger">
                Sold Out
              </span>
            ) : product.stock <= 5 ? (
              <span className="badge badge-warning">
                Only {product.stock} left
              </span>
            ) : (
              <span className="badge badge-success">
                Available
              </span>
            )}
          </div>

          {/* Description */}
          <p className="detail-description">
            {product.description}
          </p>

          {/* Cart Information */}
          {cartQty > 0 && (
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                marginBottom: '1rem',
                fontWeight: 600,
              }}
            >
              You already have {cartQty} in your bag.

              {remainingStock > 0
                ? ` ${remainingStock} more available.`
                : ' All available stock is already in your bag.'}
            </div>
          )}

          {/* Quantity + Add to Bag */}
          <div className="detail-actions">

            {!isOutOfStock && !isMaxInCart && (
              <QuantitySelector
                quantity={quantity}
                max={remainingStock}
                onChange={setQuantity}
                disabled={remainingStock <= 0}
              />
            )}

            <button
              onClick={handleAddToCart}
              disabled={
                isOutOfStock || isMaxInCart
              }
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
            >
              {isOutOfStock ? (
                'Currently Sold Out'
              ) : isMaxInCart ? (
                'All Available Stock in Bag'
              ) : (
                <>
                  <ShoppingBag size={18} />

                  {quantity > 1
                    ? `Add ${quantity} to Bag`
                    : 'Add to Bag'}
                </>
              )}
            </button>
          </div>

          {/* Added Notification */}
          {addedNotice && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background:
                  'var(--color-success-bg)',
                border:
                  '1px solid #A7F3D0',
                borderRadius:
                  'var(--radius-md)',
                color:
                  'var(--color-success)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
              }}
            >
              <Check size={16} />

              <span>{addedNotice}</span>

              <Link
                to="/cart"
                style={{
                  marginLeft: 'auto',
                  textDecoration: 'underline',
                  whiteSpace: 'nowrap',
                }}
              >
                View Bag →
              </Link>
            </div>
          )}

          {/* Boutique Highlights */}
          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              borderTop:
                '1px solid var(--color-border)',
              paddingTop: '1.5rem',
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.88rem',
                color:
                  'var(--color-text-muted)',
              }}
            >
              <Truck
                size={18}
                color="var(--color-primary)"
              />

              <span>
                Convenient delivery to your doorstep
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.88rem',
                color:
                  'var(--color-text-muted)',
              }}
            >
              <ShieldCheck
                size={18}
                color="var(--color-primary)"
              />

              <span>
                Carefully selected quality ethnic wear
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.88rem',
                color:
                  'var(--color-text-muted)',
              }}
            >
              <Sparkles
                size={18}
                color="var(--color-primary)"
              />

              <span>
                Made to add elegance to every occasion
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}