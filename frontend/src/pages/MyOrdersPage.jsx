import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMyOrders() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Unable to load your orders.');
      } finally {
        setLoading(false);
      }
    }

    fetchMyOrders();
  }, []);

  const getOrderStatusBadge = (status) => {
    const configMap = {
      CONFIRMED: { label: 'Order Placed', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
      PAYMENT_CONFIRMED: { label: 'Payment Confirmed', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
      PROCESSING: { label: 'Processing', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
      PACKED: { label: 'Packed', bg: '#E0F2FE', color: '#0284C7', border: '#BAE6FD' },
      SHIPPED: { label: 'Shipped', bg: '#F3E8FF', color: '#7C3AED', border: '#DDD6FE' },
      OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: '#CFFAFE', color: '#0891B2', border: '#A5F3FC' },
      DELIVERED: { label: 'Delivered', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
      CANCELLED: { label: 'Cancelled', bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5' },
    };

    const cfg = configMap[status] || { label: status, bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };

    return (
      <span
        style={{
          background: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.border}`,
          padding: '0.25rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        {cfg.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const isPaid = status === 'PAID';
    const isFailed = status === 'FAILED';
    const bg = isPaid ? 'var(--color-success-bg)' : isFailed ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)';
    const color = isPaid ? 'var(--color-success)' : isFailed ? 'var(--color-danger)' : 'var(--color-warning)';

    return (
      <span
        style={{
          background: bg,
          color: color,
          padding: '0.2rem 0.55rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="section" style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div
            style={{
              background: 'var(--color-danger-bg)',
              border: '1px solid #FECACA',
              color: 'var(--color-danger)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={22} />
            <div>
              <div style={{ fontWeight: 700 }}>Error loading orders</div>
              <div style={{ fontSize: '0.875rem' }}>{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="section">
        <div className="container" style={{ padding: '3rem 1.25rem' }}>
          <EmptyState
            icon={Package}
            title="No orders found"
            description="You haven't placed any orders with Vastraa Boutique yet."
            actionText="Start Shopping"
            actionLink="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">My Orders</h1>
          <p className="section-subtitle">Track status and view details of your purchases ({orders.length})</p>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="card"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)',
                }}
              >
                {/* Order Header Row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-text-subtle)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Order Number
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {order.order_number}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <Calendar size={16} />
                      <span>{formattedDate}</span>
                    </div>

                    <div>{getOrderStatusBadge(order.order_status)}</div>
                  </div>
                </div>

                {/* Items Preview */}
                <div style={{ padding: '1.25rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <img
                          src={item.product_image || '/placeholder-product.svg'}
                          alt={item.product_name}
                          style={{
                            width: '54px',
                            height: '54px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-subtle)',
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--color-text-main)' }}>
                            {item.product_name}
                          </div>
                          <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                            Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text-main)' }}>
                          ₹{parseFloat(item.subtotal).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer Row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>Payment Method</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.payment_method}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>Payment Status</span>
                      <div>{getPaymentStatusBadge(order.payment_status)}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>Total Paid</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/orders/${order.order_number}`}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.1rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    View Details &amp; Track
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
