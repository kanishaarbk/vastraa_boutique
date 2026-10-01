import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(formData);
      navigate('/my-account', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div
          className="card"
          style={{
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-primary)',
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Create Account
            </span>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Register for a boutique customer account
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--color-danger-bg)',
                border: '1px solid #FECACA',
                color: 'var(--color-danger)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="full_name"
                  className="form-input"
                  placeholder="e.g. Priya Sharma"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-subtle)',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-subtle)',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label">Phone Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Phone
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-subtle)',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Choose a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-subtle)',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="confirm_password"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-subtle)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {isSubmitting ? 'Creating Account...' : 'Register Account'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div
            style={{
              marginTop: '2rem',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
              borderTop: '1px solid var(--color-border)',
              paddingTop: '1.25rem',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
