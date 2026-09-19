import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartSummary({
  showCheckoutBtn = true,
}) {
  const {
    subtotal,
    deliveryCharge,
    totalAmount,
    totalItemsCount,
    amountUntilFreeDelivery,
  } = useCart();

  const formattedSubtotal = subtotal.toLocaleString(
    'en-IN',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  const formattedDelivery =
    deliveryCharge === 0
      ? 'FREE'
      : `₹${deliveryCharge.toFixed(2)}`;

  const formattedTotal = totalAmount.toLocaleString(
    'en-IN',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  return (
    <div className="summary-card">

      {/* Summary Heading */}
      <h3 className="summary-title">
        Bag Summary
      </h3>

      {/* Free Delivery Message */}
      {amountUntilFreeDelivery > 0 ? (
        <div
          style={{
            background:
              'var(--color-primary-subtle)',
            border:
              '1px solid var(--color-primary-border)',
            padding: '0.75rem',
            borderRadius:
              'var(--radius-md)',
            fontSize: '0.82rem',
            color:
              'var(--color-primary)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Truck size={16} />

          <span>
            Add{' '}
            <strong>
              ₹{amountUntilFreeDelivery.toFixed(2)}
            </strong>{' '}
            more for{' '}
            <strong>FREE Delivery</strong>
          </span>
        </div>
      ) : (
        <div
          style={{
            background:
              'var(--color-success-bg)',
            border:
              '1px solid #A7F3D0',
            padding: '0.75rem',
            borderRadius:
              'var(--radius-md)',
            fontSize: '0.82rem',
            color:
              'var(--color-success)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <Truck size={16} />

          <span>
            You've unlocked FREE delivery!
          </span>
        </div>
      )}

      {/* Items */}
      <div className="summary-row">
        <span>
          Items ({totalItemsCount})
        </span>

        <span>
          ₹{formattedSubtotal}
        </span>
      </div>

      {/* Delivery */}
      <div className="summary-row">
        <span>
          Delivery
        </span>

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
        <span>
          Total
        </span>

        <span className="total-amount">
          ₹{formattedTotal}
        </span>
      </div>

      {/* Checkout Actions */}
      {showCheckoutBtn && (
        <div
          style={{
            marginTop: '1.5rem',
          }}
        >
          <Link
            to="/checkout"
            className="btn btn-primary btn-block btn-lg"
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/shop"
            className="btn btn-secondary btn-block btn-sm"
            style={{
              marginTop: '0.75rem',
            }}
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Security Message */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1.25rem',
          fontSize: '0.78rem',
          color:
            'var(--color-text-subtle)',
          justifyContent: 'center',
        }}
      >
        <ShieldCheck
          size={16}
          color="var(--color-primary)"
        />

        <span>
          Secure &amp; encrypted checkout
        </span>
      </div>

    </div>
  );
}