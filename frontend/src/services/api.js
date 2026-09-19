/**
 * Centralized API client
 * React Frontend → Django REST Framework Backend
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

/**
 * Common API request handler
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      let errorMessage =
        'Something went wrong. Please try again.';

      if (data?.error) {
        errorMessage = data.error;
      } else if (data?.detail) {
        errorMessage = data.detail;
      } else if (Array.isArray(data)) {
        errorMessage = data[0] || errorMessage;
      } else if (
        data &&
        typeof data === 'object'
      ) {
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)
          .map((value) =>
            typeof value === 'string'
              ? value
              : String(value)
          );

        if (messages.length > 0) {
          errorMessage =
            messages.join(' ');
        }
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    /*
     * Network / server connection error
     */
    if (
      error instanceof TypeError ||
      error?.message
        ?.toLowerCase()
        .includes('failed to fetch')
    ) {
      throw new Error(
        'Unable to connect to the boutique server. Please check your connection and try again.'
      );
    }

    throw error;
  }
}

/**
 * Public API methods
 */
export const api = {
  /**
   * ------------------------------------------------
   * PRODUCTS
   * ------------------------------------------------
   */

  /**
   * Fetch products.
   *
   * Supported filters:
   * - search
   * - category
   * - featured
   * - ordering
   */
  async getProducts(params = {}) {
    const query =
      new URLSearchParams();

    if (params.search) {
      query.append(
        'search',
        params.search
      );
    }

    if (params.category) {
      query.append(
        'category',
        params.category
      );
    }

    if (params.featured) {
      query.append(
        'featured',
        'true'
      );
    }

    if (params.ordering) {
      query.append(
        'ordering',
        params.ordering
      );
    }

    const queryString =
      query.toString();

    const endpoint =
      queryString
        ? `/api/products/?${queryString}`
        : '/api/products/';

    return request(endpoint);
  },

  /**
   * Fetch one product by ID.
   */
  async getProduct(id) {
    if (!id) {
      throw new Error(
        'Product information is missing.'
      );
    }

    return request(
      `/api/products/${id}/`
    );
  },

  /**
   * ------------------------------------------------
   * CATEGORIES
   * ------------------------------------------------
   */

  /**
   * Fetch all product categories.
   */
  async getCategories() {
    return request(
      '/api/categories/'
    );
  },

  /**
   * ------------------------------------------------
   * ORDERS
   * ------------------------------------------------
   */

  /**
   * Create an order.
   *
   * Payment methods:
   * - COD
   * - RAZORPAY
   */
  async createOrder(orderPayload) {
    if (!orderPayload) {
      throw new Error(
        'Order information is missing.'
      );
    }

    return request(
      '/api/orders/',
      {
        method: 'POST',
        body: JSON.stringify(
          orderPayload
        ),
      }
    );
  },

  /**
   * Get order details using
   * order ID or order number.
   */
  async getOrder(lookup) {
    if (!lookup) {
      throw new Error(
        'Order number is required.'
      );
    }

    return request(
      `/api/orders/${lookup}/`
    );
  },

  /**
   * ------------------------------------------------
   * RAZORPAY PAYMENT
   * ------------------------------------------------
   */

  /**
   * Verify Razorpay payment
   * on the Django backend.
   *
   * IMPORTANT:
   * Payment verification happens
   * server-side. Never put the
   * Razorpay secret key here.
   */
  async verifyPayment(
    verificationPayload
  ) {
    if (!verificationPayload) {
      throw new Error(
        'Payment verification information is missing.'
      );
    }

    return request(
      '/api/payments/verify/',
      {
        method: 'POST',
        body: JSON.stringify(
          verificationPayload
        ),
      }
    );
  },
};