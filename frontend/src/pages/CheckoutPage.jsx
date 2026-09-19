import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { openRazorpayCheckout } from '../services/razorpay';

import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import EmptyState from '../components/EmptyState';

export default function CheckoutPage() {
  const navigate = useNavigate();

  const {
    items,
    clearCart,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  /* Empty Bag */
  if (items.length === 0) {
    return (
      <div
        className="container"
        style={{
          padding: '4rem 1.25rem',
        }}
      >
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Add a few beautiful styles to your bag before continuing to checkout."
          actionText="Explore Collection"
          actionLink="/shop"
        />
      </div>
    );
  }

  const handleCheckoutSubmit = async (customerData) => {
    try {
      setIsSubmitting(true);
      setCheckoutError(null);

      /* Prepare order payload */
      const orderPayload = {
        customer_name: customerData.customer_name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        pincode: customerData.pincode,
        payment_method: customerData.payment_method,

        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      /* Create order on backend */
      const orderResponse = await api.createOrder(orderPayload);

      /* Cash on Delivery */
      if (customerData.payment_method === 'COD') {
        clearCart();

        navigate(
          `/order-success/${orderResponse.order_number}`,
          {
            state: {
              order: orderResponse,
            },
          }
        );

        return;
      }

      /* Razorpay Online Payment */
      if (customerData.payment_method === 'RAZORPAY') {
        if (!orderResponse.razorpay) {
          throw new Error(
            'Online payment could not be started. Please try again.'
          );
        }

        await openRazorpayCheckout({
          razorpayOrder: {
            ...orderResponse.razorpay,
            order_number: orderResponse.order_number,
          },

          customer: {
            name: customerData.customer_name,
            email: customerData.email,
            phone: customerData.phone,
          },

          /* Payment Success */
          onSuccess: async (paymentResponse) => {
            try {
              const verifyResult = await api.verifyPayment({
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,
              });

              clearCart();

              navigate(
                `/order-success/${orderResponse.order_number}`,
                {
                  state: {
                    order: verifyResult.order,
                  },
                }
              );
            } catch (vErr) {
              setCheckoutError(
                vErr.message ||
                  'Payment verification failed. Please contact support.'
              );

              setIsSubmitting(false);
            }
          },

          /* Payment Failed */
          onFailure: (err) => {
            setCheckoutError(
              err.message ||
                'Payment was unsuccessful. Please try again.'
            );

            setIsSubmitting(false);
          },

          /* Razorpay Window Closed */
          onDismiss: () => {
            setIsSubmitting(false);

            setCheckoutError(
              'Payment cancelled. You can try again when you are ready.'
            );
          },
        });
      }
    } catch (err) {
      setCheckoutError(
        err.message ||
          'Unable to place your order. Please check your details and try again.'
      );

      setIsSubmitting(false);
    }
  };

  return (
    <div className="section">
      <div className="container">

        {/* Header */}
        <div
          style={{
            marginBottom: '1.5rem',
          }}
        >
          <Link
            to="/cart"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: '0.75rem',
            }}
          >
            <ArrowLeft size={16} />
            Back to Shopping Bag
          </Link>

          <h1 className="section-title">
            Checkout
          </h1>

          <p className="section-subtitle">
            Complete your delivery details and choose
            how you'd like to pay.
          </p>
        </div>

        {/* Error */}
        {checkoutError && (
          <div
            style={{
              background: 'var(--color-danger-bg)',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              color: 'var(--color-danger)',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <AlertCircle
              size={20}
              style={{
                flexShrink: 0,
                marginTop: '1px',
              }}
            />

            <span>{checkoutError}</span>
          </div>
        )}

        {/* Checkout Layout */}
        <div className="checkout-layout">

          {/* Customer + Payment */}
          <div>
            <CheckoutForm
              onSubmit={handleCheckoutSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Order Summary */}
          <div>
            <OrderSummary />

            {/* Secure Checkout */}
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-primary-subtle)',
                border:
                  '1px solid var(--color-primary-border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}
            >
              <ShieldCheck
                size={18}
                color="var(--color-primary)"
                style={{
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: 'var(--color-primary)',
                    marginBottom: '0.2rem',
                  }}
                >
                  Secure Checkout
                </div>

                <div
                  style={{
                    fontSize: '0.76rem',
                    lineHeight: 1.5,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Your order details are securely processed
                  and your payment information is protected.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}