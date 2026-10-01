import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/my-account';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
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
              Welcome Back
            </span>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Sign in to manage your orders &amp; account profile
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
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
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
              {isSubmitting ? 'Signing In...' : 'Sign In'}
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
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
