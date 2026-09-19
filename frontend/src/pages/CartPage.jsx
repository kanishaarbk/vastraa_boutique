import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  /* Empty Bag */
  if (items.length === 0) {
    return (
      <div
        className="container"
        style={{
          padding: '3rem 1.25rem',
        }}
      >
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is waiting"
          description="You haven't added any styles yet. Explore our collection and find something you'll love."
          actionText="Explore Collection"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            gap: '1rem',
          }}
        >
          <div>
            <h1 className="section-title">
              Your Shopping Bag
            </h1>

            <p className="section-subtitle">
              Review your selected styles before checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="btn btn-sm btn-secondary"
            style={{
              color: 'var(--color-danger)',
              borderColor: '#FECACA',
            }}
            title="Clear all items from your bag"
          >
            <Trash2 size={14} />
            Clear Bag
          </button>
        </div>

        {/* Layout */}
        <div className="cart-layout">

          {/* Bag Items */}
          <div className="cart-items-table">
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}

            {/* Continue Shopping */}
            <div
              style={{
                marginTop: '1rem',
              }}
            >
              <Link
                to="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Bag Summary */}
          <div>
            <CartSummary
              showCheckoutBtn={true}
            />
          </div>

        </div>
      </div>
    </div>
  );
}