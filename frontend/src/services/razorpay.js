/**
 * Razorpay Checkout SDK Loader & Execution Handler
 */

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay Standard Checkout popup.
 */
export async function openRazorpayCheckout({
  razorpayOrder,
  customer,
  onSuccess,
  onFailure,
  onDismiss,
}) {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    onFailure?.(
      new Error(
        'Razorpay SDK failed to load. Please check your network connection.'
      )
    );

    return;
  }

  const options = {
    key: razorpayOrder.key_id,

    amount: razorpayOrder.amount,

    currency:
      razorpayOrder.currency || 'INR',

    name: 'Vastraa Boutique',

    description: `Order #${
      razorpayOrder.order_number || ''
    }`,

    order_id: razorpayOrder.order_id,

    prefill: {
      name: customer.name || '',
      email: customer.email || '',
      contact: customer.phone || '',
    },

    theme: {
      color: '#722F37',
    },

    // Payment methods
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
    },

    handler: async function (response) {
      try {
        if (onSuccess) {
          await onSuccess(response);
        }
      } catch (err) {
        onFailure?.(err);
      }
    },

    modal: {
      ondismiss: function () {
        onDismiss?.();
      },
    },
  };

  try {
    const paymentObject =
      new window.Razorpay(options);

    paymentObject.on(
      'payment.failed',
      function (response) {
        onFailure?.(
          new Error(
            response?.error?.description ||
              'Payment was declined.'
          )
        );
      }
    );

    paymentObject.open();
  } catch (error) {
    onFailure?.(error);
  }
}