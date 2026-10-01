/**
 * Centralized API client
 * React Frontend → Django REST Framework Backend
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

const TOKEN_KEY = 'vastraa_boutique_token';

/**
 * Common API request handler
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const token = localStorage.getItem(TOKEN_KEY);

  const authHeader = token ? { Authorization: `Token ${token}` } : {};

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeader,
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
   * AUTHENTICATION
   * ------------------------------------------------
   */
  async register(payload) {
    return request('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload) {
    return request('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout() {
    return request('/api/auth/logout/', {
      method: 'POST',
    });
  },

  async getMe() {
    return request('/api/auth/me/');
  },

  async updateProfile(payload) {
    return request('/api/auth/me/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * ------------------------------------------------
   * PRODUCTS
   * ------------------------------------------------
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams();

    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.featured) query.append('featured', 'true');
    if (params.ordering) query.append('ordering', params.ordering);

    const queryString = query.toString();
    const endpoint = queryString ? `/api/products/?${queryString}` : '/api/products/';

    return request(endpoint);
  },

  async getProduct(id) {
    if (!id) {
      throw new Error('Product information is missing.');
    }
    return request(`/api/products/${id}/`);
  },

  /**
   * ------------------------------------------------
   * CATEGORIES
   * ------------------------------------------------
   */
  async getCategories() {
    return request('/api/categories/');
  },

  /**
   * ------------------------------------------------
   * ORDERS
   * ------------------------------------------------
   */
  async createOrder(orderPayload) {
    if (!orderPayload) {
      throw new Error('Order information is missing.');
    }
    return request('/api/orders/', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  },

  async getMyOrders() {
    return request('/api/orders/my-orders/');
  },

  async getOrder(lookup) {
    if (!lookup) {
      throw new Error('Order number is required.');
    }
    return request(`/api/orders/${lookup}/`);
  },

  /**
   * ------------------------------------------------
   * RAZORPAY PAYMENT
   * ------------------------------------------------
   */
  async verifyPayment(verificationPayload) {
    if (!verificationPayload) {
      throw new Error('Payment verification information is missing.');
    }
    return request('/api/payments/verify/', {
      method: 'POST',
      body: JSON.stringify(verificationPayload),
    });
  },
};