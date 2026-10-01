import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  MapPin,
  CreditCard,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        setForbidden(false);
        const data = await api.getOrder(id);
        setOrder(data);
      } catch (err) {
        if (err.message?.includes('permission') || err.message?.includes('403') || err.message?.includes('Authentication required')) {
          setForbidden(true);
        } else {
          setError(err.message || 'Unable to retrieve order details.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="section" style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <LoadingSpinner />
      </div>
    );
  }

  /* Security 403 Forbidden State */
  if (forbidden) {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '3rem 1.25rem' }}>
          <div
            style={{
              background: 'var(--color-danger-bg)',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 2rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <ShieldAlert size={48} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-danger)', fontWeight: 700, marginBottom: '0.5rem' }}>
              Access Denied (403 Forbidden)
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You do not have authorization to view this order. Customer orders are strictly protected and can only be viewed by the account holder who placed them.
            </p>
            <Link to="/my-orders" className="btn btn-primary">
              Return to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '3rem 1.25rem' }}>
          <div
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 2rem',
            }}
          >
            <AlertCircle size={44} style={{ color: 'var(--color-warning)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Order Not Found</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {error || 'The requested order could not be located.'}
            </p>
            <Link to="/my-orders" className="btn btn-primary">
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* Define Timeline Stages */
  const timelineStages = [
    { key: 'CONFIRMED', label: 'Order Placed', icon: Clock },
    { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', icon: CreditCard },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'PACKED', label: 'Packed', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStatus = order.order_status;
  const isCancelled = currentStatus === 'CANCELLED';

  // Determine active stage index
  let currentStageIndex = timelineStages.findIndex((s) => s.key === currentStatus);
  if (currentStageIndex === -1 && !isCancelled) {
    currentStageIndex = 0; // fallback to placed
  }

  // If order is paid, payment stage is completed
  const isPaid = order.payment_status === 'PAID';

  const formattedOrderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Navigation back link */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/my-orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            Back to My Orders
          </Link>
        </div>

        {/* Order Header */}
        <div
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
              Order Reference
            </div>
            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 700, margin: '0.2rem 0 0.4rem 0' }}>
              {order.order_number}
            </h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Placed on {formattedOrderDate}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', fontWeight: 600 }}>
              Grand Total
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* VISUAL ORDER TRACKER TIMELINE */}
        <div
          className="card"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            style={{
              fontSize: '1.15rem',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary)',
              fontWeight: 700,
              marginBottom: '1.75rem',
            }}
          >
            Order Tracking &amp; Delivery Progress
          </h2>

          {isCancelled ? (
            /* Cancelled Banner */
            <div
              style={{
                background: 'var(--color-danger-bg)',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                color: 'var(--color-danger)',
              }}
            >
              <XCircle size={32} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>This order has been Cancelled</div>
                <div style={{ fontSize: '0.875rem', marginTop: '2px', opacity: 0.9 }}>
                  If you have questions regarding payment refund or cancellation reasons, please contact boutique support.
                </div>
              </div>
            </div>
          ) : (
            /* Timeline Steps */
            <div className="order-tracker-timeline">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${timelineStages.length}, 1fr)`,
                  gap: '0.5rem',
                  position: 'relative',
                }}
              >
                {timelineStages.map((stage, idx) => {
                  const isCompleted = idx < currentStageIndex || (stage.key === 'PAYMENT_CONFIRMED' && isPaid);
                  const isCurrent = idx === currentStageIndex && !(stage.key === 'PAYMENT_CONFIRMED' && isPaid);
                  const StageIcon = stage.icon;

                  let circleBg = 'var(--color-bg-muted)';
                  let circleColor = 'var(--color-text-light)';
                  let circleBorder = 'var(--color-border)';

                  if (isCompleted) {
                    circleBg = 'var(--color-success)';
                    circleColor = '#fff';
                    circleBorder = 'var(--color-success)';
                  } else if (isCurrent) {
                    circleBg = 'var(--color-primary)';
                    circleColor = '#fff';
                    circleBorder = 'var(--color-primary)';
                  }

                  return (
                    <div
                      key={stage.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {/* Step Circle */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: circleBg,
                          color: circleColor,
                          border: `2px solid ${circleBorder}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '0.65rem',
                          boxShadow: isCurrent ? '0 0 0 4px var(--color-primary-subtle)' : 'none',
                          transition: 'var(--transition)',
                        }}
                      >
                        {isCompleted ? <Check size={20} strokeWidth={2.5} /> : <StageIcon size={18} />}
                      </div>

                      {/* Step Label */}
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: isCurrent || isCompleted ? 700 : 500,
                          color: isCurrent ? 'var(--color-primary)' : isCompleted ? 'var(--color-text-main)' : 'var(--color-text-light)',
                          lineHeight: 1.25,
                        }}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details & Shipping Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Customer & Shipping Card */}
          <div
            className="card"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
              <MapPin size={20} />
              Shipping Address
            </div>

            <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--color-text-main)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.customer_name}</div>
              <div>{order.address}</div>
              <div>
                {order.city}, {order.state} - {order.pincode}
              </div>
              <div style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                <div>📞 {order.phone}</div>
                <div>✉️ {order.email}</div>
              </div>
            </div>
          </div>

          {/* Payment & Summary Card */}
          <div
            className="card"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
              <CreditCard size={20} />
              Payment Summary
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: 600 }}>{order.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Payment Status</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: order.payment_status === 'PAID' ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                >
                  {order.payment_status}
                </span>
              </div>

              <div style={{ borderTop: '1px dashed var(--color-border)', margin: '0.4rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Items Subtotal</span>
                <span>₹{parseFloat(order.subtotal).toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Delivery Charge</span>
                <span>{parseFloat(order.delivery_charge) === 0 ? 'FREE' : `₹${parseFloat(order.delivery_charge)}`}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                <span>Total</span>
                <span>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div
          className="card"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            style={{
              fontSize: '1.15rem',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary)',
              fontWeight: 700,
              marginBottom: '1.25rem',
            }}
          >
            Ordered Items ({order.items?.length || 0})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <img
                  src={item.product_image || '/placeholder-product.svg'}
                  alt={item.product_name}
                  style={{
                    width: '72px',
                    height: '72px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-subtle)',
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)' }}>
                    {item.product_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Unit Price: ₹{parseFloat(item.price).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', display: 'block' }}>Qty</span>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{item.quantity}</span>
                </div>

                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', display: 'block' }}>Subtotal</span>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                    ₹{parseFloat(item.subtotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
