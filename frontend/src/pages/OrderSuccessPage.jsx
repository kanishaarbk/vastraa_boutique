import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  PackageCheck,
} from 'lucide-react';

import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(
    location.state?.order || null
  );

  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use order passed through navigation state.
    // Otherwise fetch it from the backend.
    if (!order && orderNumber) {
      async function loadOrder() {
        try {
          setLoading(true);

          const data =
            await api.getOrder(orderNumber);

          setOrder(data);
        } catch (err) {
          setError(
            err.message ||
              'Could not locate your order details'
          );
        } finally {
          setLoading(false);
        }
      }

      loadOrder();
    }
  }, [orderNumber]);

  /* Loading */
  if (loading) {
    return (
      <div
        className="container"
        style={{
          padding: '4rem 1.25rem',
        }}
      >
        <LoadingSpinner
          message="Preparing your order confirmation..."
        />
      </div>
    );
  }

  /* Error */
  if (error || !order) {
    return (
      <div
        className="container"
        style={{
          padding: '4rem 1.25rem',
        }}
      >
        <ErrorMessage
          message={
            error ||
            'Order could not be found.'
          }
        />

        <Link
          to="/shop"
          className="btn btn-primary"
          style={{
            marginTop: '1rem',
          }}
        >
          <ShoppingBag size={16} />
          Explore Collection
        </Link>
      </div>
    );
  }

  const formattedTotal =
    parseFloat(
      order.total_amount
    ).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formattedSubtotal =
    parseFloat(
      order.subtotal
    ).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formattedDelivery =
    parseFloat(
      order.delivery_charge
    ) === 0
      ? 'FREE'
      : `₹${parseFloat(
          order.delivery_charge
        ).toFixed(2)}`;

  return (
    <div
      className="container"
      style={{
        padding:
          '2rem 1.25rem 4rem',
      }}
    >
      <div className="success-card">

        {/* Success Icon */}
        <div className="success-icon-wrap">
          <CheckCircle size={40} />
        </div>

        {/* Heading */}
        <h1 className="success-title">
          Thank You for Your Order!
        </h1>

        <p className="success-desc">
          Thank you,{' '}
          <strong>
            {order.customer_name}
          </strong>
          . Your order has been received and
          we're getting your beautiful styles
          ready for you.
        </p>

        {/* Order Information */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}
        >

          {/* Order ID */}
          <div
            className="badge badge-primary"
            style={{
              padding:
                '0.4rem 0.85rem',
              fontSize: '0.85rem',
            }}
          >
            Order ID:{' '}
            <strong>
              {order.order_number}
            </strong>
          </div>

          {/* Payment */}
          <div
            className={`badge ${
              order.payment_status ===
              'PAID'
                ? 'badge-success'
                : 'badge-warning'
            }`}
            style={{
              padding:
                '0.4rem 0.85rem',
              fontSize: '0.85rem',
            }}
          >
            Payment:{' '}
            <strong>
              {order.payment_status}
            </strong>
          </div>

          {/* Order Status */}
          <div
            className="badge badge-success"
            style={{
              padding:
                '0.4rem 0.85rem',
              fontSize: '0.85rem',
            }}
          >
            Status:{' '}
            <strong>
              {order.order_status}
            </strong>
          </div>

        </div>

        {/* Receipt */}
        <div className="receipt-details">

          {/* Delivery Details */}
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color:
                'var(--color-text-main)',
              marginBottom: '1rem',
              borderBottom:
                '1px solid var(--color-border)',
              paddingBottom: '0.6rem',
            }}
          >
            Delivery Details
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr',
              gap: '0.7rem',
              fontSize: '0.9rem',
              color:
                'var(--color-text-muted)',
              marginBottom: '1.5rem',
            }}
          >

            {/* Address */}
            <div
              style={{
                display: 'flex',
                alignItems:
                  'flex-start',
                gap: '0.5rem',
              }}
            >
              <MapPin
                size={16}
                color="var(--color-primary)"
                style={{
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              />

              <span>
                {order.address},{' '}
                {order.city},{' '}
                {order.state} -{' '}
                {order.pincode}
              </span>
            </div>

            {/* Phone */}
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                gap: '0.5rem',
              }}
            >
              <Phone
                size={16}
                color="var(--color-primary)"
              />

              <span>
                {order.phone}
              </span>
            </div>

            {/* Email */}
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                gap: '0.5rem',
              }}
            >
              <Mail
                size={16}
                color="var(--color-primary)"
              />

              <span>
                {order.email}
              </span>
            </div>

          </div>

          {/* Ordered Styles */}
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color:
                'var(--color-text-main)',
              marginBottom: '1rem',
              borderBottom:
                '1px solid var(--color-border)',
              paddingBottom: '0.6rem',
            }}
          >
            Your Selected Styles
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection:
                'column',
              gap: '0.75rem',
              marginBottom:
                '1.25rem',
            }}
          >
            {order.items &&
              order.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="receipt-row"
                  >
                    <span>
                      <strong>
                        {item.quantity}x
                      </strong>{' '}
                      {item.product_name}
                    </span>

                    <span>
                      ₹
                      {parseFloat(
                        item.subtotal
                      ).toFixed(2)}
                    </span>
                  </div>
                )
              )}
          </div>

          {/* Price Breakdown */}
          <div className="receipt-row">
            <span>
              Subtotal
            </span>

            <span>
              ₹{formattedSubtotal}
            </span>
          </div>

          <div className="receipt-row">
            <span>
              Delivery
            </span>

            <span>
              {formattedDelivery}
            </span>
          </div>

          <div
            className="receipt-row"
            style={{
              fontWeight: 800,
              fontSize: '1.1rem',
              color:
                'var(--color-primary)',
              marginTop: '0.35rem',
            }}
          >
            <span>
              Total
            </span>

            <span>
              ₹{formattedTotal}
            </span>
          </div>

        </div>

        {/* Confirmation Note */}
        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            gap: '0.5rem',
            margin:
              '1.5rem 0',
            color:
              'var(--color-text-muted)',
            fontSize: '0.82rem',
          }}
        >
          <PackageCheck
            size={18}
            color="var(--color-primary)"
          />

          <span>
            Your order is now being prepared.
          </span>
        </div>

        {/* Continue Shopping */}
        <Link
          to="/shop"
          className="btn btn-primary btn-lg"
          style={{
            minWidth: '220px',
          }}
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>

      </div>
    </div>
  );
}