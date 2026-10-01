import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Package, Edit3, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MyAccountPage() {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleEditClick = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
    });
    setError(null);
    setSuccessMsg(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      setIsSubmitting(true);
      await updateProfile(formData);
      setSuccessMsg('Profile details updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">My Account</h1>
          <p className="section-subtitle">Manage your personal profile and account details</p>
        </div>

        {/* Feedback banners */}
        {successMsg && (
          <div
            style={{
              background: 'var(--color-success-bg)',
              border: '1px solid #A7F3D0',
              color: 'var(--color-success)',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            {successMsg}
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'var(--color-danger-bg)',
              border: '1px solid #FECACA',
              color: 'var(--color-danger)',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Account Details Card */}
        <div
          className="card"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                }}
              >
                Personal Information
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                Your account details stored securely with Vastraa Boutique
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleEditClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.85rem',
                }}
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            /* View Mode */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <User size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Full Name
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {user?.full_name || 'Not provided'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Mail size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Email Address
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Phone size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Phone Number
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {user?.phone || 'Not provided'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Calendar size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Member Since
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {formattedDate}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Email Address (Read-only)</label>
                <input type="email" className="form-input" value={user?.email || ''} disabled style={{ backgroundColor: 'var(--color-bg-muted)', opacity: 0.8 }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Check size={16} />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Links Card */}
        <div
          style={{
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>Your Orders</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>View purchase history and track active deliveries</p>
            </div>
          </div>

          <Link to="/my-orders" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
