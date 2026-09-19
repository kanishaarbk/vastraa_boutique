import React from 'react';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuantitySelector from './QuantitySelector';

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}) {
  const { product, quantity } = item;

  const itemTotal = (
    parseFloat(product.price) * quantity
  ).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const unitPrice = parseFloat(
    product.price
  ).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="cart-item-row">

      {/* Product Image */}
      <img
        src={
          product.image_url ||
          '/placeholder-product.svg'
        }
        alt={product.name}
        className="cart-item-thumb"
        onError={(e) => {
          e.currentTarget.src =
            '/placeholder-product.svg';
        }}
      />

      {/* Product Information */}
      <div className="cart-item-info">

        <Link
          to={`/products/${product.id}`}
          className="cart-item-title"
        >
          {product.name}
        </Link>

        <span className="cart-item-price">
          ₹{unitPrice} each
        </span>

        {product.stock <= 5 &&
          product.stock > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-warning)',
              }}
            >
              Only {product.stock} left
            </span>
          )}

        {product.stock <= 0 && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-danger)',
              fontWeight: 600,
            }}
          >
            Currently sold out
          </span>
        )}

      </div>

      {/* Quantity + Remove */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <QuantitySelector
          quantity={quantity}
          max={product.stock}
          onChange={(newQty) =>
            onUpdateQuantity(
              product.id,
              newQty
            )
          }
          disabled={product.stock <= 0}
        />

        <button
          type="button"
          onClick={() =>
            onRemove(product.id)
          }
          className="remove-btn"
          aria-label={`Remove ${product.name} from shopping bag`}
          title="Remove from bag"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Item Total */}
      <div className="cart-item-total">
        ₹{itemTotal}
      </div>

    </div>
  );
}