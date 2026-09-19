import React from 'react';
import { useCart } from '../context/CartContext';

export default function OrderSummary() {
  const {
    items,
    subtotal,
    deliveryCharge,
    totalAmount,
    totalItemsCount,
  } = useCart();

  const formattedSubtotal =
    subtotal.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formattedDelivery =
    deliveryCharge === 0
      ? 'FREE'
      : `₹${deliveryCharge.toFixed(2)}`;

  const formattedTotal =
    totalAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="summary-card">

      {/* Heading */}
      <h3 className="summary-title">
        Your Bag ({totalItemsCount})
      </h3>

      {/* Items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
          marginBottom: '1.25rem',
        }}
      >
        {items.map(({ product, quantity }) => {
          const itemTotal = (
            parseFloat(product.price) * quantity
          ).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          return (
            <div
              key={product.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                fontSize: '0.88rem',
              }}
            >

              {/* Product */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  minWidth: 0,
                }}
              >
                <img
                  src={
                    product.image_url ||
                    '/placeholder-product.svg'
                  }
                  alt={product.name}
                  style={{
                    width: '50px',
                    height: '62px',
                    borderRadius:
                      'var(--radius-sm)',
                    objectFit: 'cover',
                    border:
                      '1px solid var(--color-border)',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      '/placeholder-product.svg';
                  }}
                />

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color:
                        'var(--color-text-main)',
                      lineHeight: 1.35,
                    }}
                  >
                    {product.name}
                  </div>

                  <div
                    style={{
                      color:
                        'var(--color-text-subtle)',
                      fontSize: '0.78rem',
                      marginTop: '0.2rem',
                    }}
                  >
                    Qty: {quantity} × ₹
                    {parseFloat(
                      product.price
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Item Total */}
              <div
                style={{
                  fontWeight: 700,
                  color:
                    'var(--color-text-main)',
                  whiteSpace: 'nowrap',
                }}
              >
                ₹{itemTotal}
              </div>

            </div>
          );
        })}
      </div>

      {/* Subtotal */}
      <div
        className="summary-row"
        style={{
          borderTop:
            '1px solid var(--color-border)',
          paddingTop: '1rem',
        }}
      >
        <span>Subtotal</span>

        <span>
          ₹{formattedSubtotal}
        </span>
      </div>

      {/* Delivery */}
      <div className="summary-row">
        <span>Delivery</span>

        <span
          style={{
            color:
              deliveryCharge === 0
                ? 'var(--color-success)'
                : 'inherit',
            fontWeight: 600,
          }}
        >
          {formattedDelivery}
        </span>
      </div>

      {/* Total */}
      <div className="summary-row total">
        <span>Total Payable</span>

        <span className="total-amount">
          ₹{formattedTotal}
        </span>
      </div>

    </div>
  );
}