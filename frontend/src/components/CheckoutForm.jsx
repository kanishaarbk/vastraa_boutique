import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
} from 'lucide-react';

export default function CheckoutForm({
  onSubmit,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'COD',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};

    if (!formData.customer_name.trim()) {
      errs.customer_name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (
      !/^\d{10}$/.test(
        formData.phone.replace(/[^0-9]/g, '')
      )
    ) {
      errs.phone =
        'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      errs.email =
        'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      errs.address =
        'Delivery address is required';
    }

    if (!formData.city.trim()) {
      errs.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errs.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (
      !/^\d{6}$/.test(
        formData.pincode.replace(/[^0-9]/g, '')
      )
    ) {
      errs.pincode =
        'Please enter a valid 6-digit pincode';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Customer Details */}
      <div className="checkout-card">

        <h3 className="checkout-card-title">
          <User
            size={20}
            color="var(--color-primary)"
          />
          Contact &amp; Delivery Details
        </h3>

        <div className="form-grid">

          {/* Full Name */}
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="customer_name"
            >
              Full Name *
            </label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform:
                    'translateY(-50%)',
                  color:
                    'var(--color-text-subtle)',
                  pointerEvents: 'none',
                }}
              />

              <input
                id="customer_name"
                name="customer_name"
                type="text"
                placeholder="Enter your full name"
                value={
                  formData.customer_name
                }
                onChange={handleChange}
                className={`form-input ${
                  errors.customer_name
                    ? 'is-invalid'
                    : ''
                }`}
                style={{
                  paddingLeft: '2.5rem',
                }}
              />
            </div>

            {errors.customer_name && (
              <span className="form-error">
                {errors.customer_name}
              </span>
            )}
          </div>

          {/* Phone & Email */}
          <div className="form-grid form-grid-2">

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="phone"
              >
                Phone Number *
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Phone
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    color:
                      'var(--color-text-subtle)',
                    pointerEvents: 'none',
                  }}
                />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.phone
                      ? 'is-invalid'
                      : ''
                  }`}
                  style={{
                    paddingLeft: '2.5rem',
                  }}
                />
              </div>

              {errors.phone && (
                <span className="form-error">
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="email"
              >
                Email Address *
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    color:
                      'var(--color-text-subtle)',
                    pointerEvents: 'none',
                  }}
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yourname@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.email
                      ? 'is-invalid'
                      : ''
                  }`}
                  style={{
                    paddingLeft: '2.5rem',
                  }}
                />
              </div>

              {errors.email && (
                <span className="form-error">
                  {errors.email}
                </span>
              )}
            </div>

          </div>

          {/* Address */}
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="address"
            >
              Delivery Address *
            </label>

            <div
              style={{
                position: 'relative',
              }}
            >
              <MapPin
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '0.9rem',
                  color:
                    'var(--color-text-subtle)',
                  pointerEvents: 'none',
                }}
              />

              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="House / Flat No., Building, Street, Area"
                value={formData.address}
                onChange={handleChange}
                className={`form-textarea ${
                  errors.address
                    ? 'is-invalid'
                    : ''
                }`}
                style={{
                  paddingLeft: '2.5rem',
                }}
              />
            </div>

            {errors.address && (
              <span className="form-error">
                {errors.address}
              </span>
            )}
          </div>

          {/* City / State / Pincode */}
          <div className="form-grid form-grid-3">

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="city"
              >
                City *
              </label>

              <input
                id="city"
                name="city"
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className={`form-input ${
                  errors.city
                    ? 'is-invalid'
                    : ''
                }`}
              />

              {errors.city && (
                <span className="form-error">
                  {errors.city}
                </span>
              )}
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="state"
              >
                State *
              </label>

              <input
                id="state"
                name="state"
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className={`form-input ${
                  errors.state
                    ? 'is-invalid'
                    : ''
                }`}
              />

              {errors.state && (
                <span className="form-error">
                  {errors.state}
                </span>
              )}
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="pincode"
              >
                Pincode *
              </label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit PIN"
                value={formData.pincode}
                onChange={handleChange}
                className={`form-input ${
                  errors.pincode
                    ? 'is-invalid'
                    : ''
                }`}
              />

              {errors.pincode && (
                <span className="form-error">
                  {errors.pincode}
                </span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="checkout-card">

        <h3 className="checkout-card-title">
          <CreditCard
            size={20}
            color="var(--color-primary)"
          />
          Choose Payment Method
        </h3>

        <div className="payment-methods-stack">

          {/* COD */}
          <label
            className={`payment-option ${
              formData.payment_method === 'COD'
                ? 'selected'
                : ''
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              value="COD"
              checked={
                formData.payment_method === 'COD'
              }
              onChange={handleChange}
            />

            <div className="payment-option-text">

              <div
                className="payment-option-title"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Banknote
                  size={18}
                  color="var(--color-primary)"
                />
                Cash on Delivery
              </div>

              <div className="payment-option-desc">
                Pay in cash when your order
                arrives at your doorstep.
              </div>

            </div>
          </label>

          {/* Razorpay */}
          <label
            className={`payment-option ${
              formData.payment_method ===
              'RAZORPAY'
                ? 'selected'
                : ''
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              value="RAZORPAY"
              checked={
                formData.payment_method ===
                'RAZORPAY'
              }
              onChange={handleChange}
            />

            <div className="payment-option-text">

              <div
                className="payment-option-title"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CreditCard
                  size={18}
                  color="var(--color-primary)"
                />
                Pay Online
              </div>

              <div className="payment-option-desc">
                Secure payment through UPI,
                cards or NetBanking.
              </div>

              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color:
                    'var(--color-text-subtle)',
                }}
              >
                UPI includes GPay, PhonePe
                and other supported apps.
              </div>

            </div>
          </label>

        </div>
      </div>

      {/* Place Order */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary btn-block btn-lg"
      >
        {isSubmitting ? (
          'Processing Your Order...'
        ) : formData.payment_method ===
          'RAZORPAY' ? (
          'Proceed to Secure Payment'
        ) : (
          'Confirm & Place Order'
        )}
      </button>

      {/* Security Note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          marginTop: '0.85rem',
          fontSize: '0.75rem',
          color:
            'var(--color-text-subtle)',
        }}
      >
        <ShieldCheck
          size={15}
          color="var(--color-primary)"
        />

        <span>
          Your details are handled securely.
        </span>
      </div>

    </form>
  );
}