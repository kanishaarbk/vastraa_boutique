import React from 'react';

export default function LoadingSpinner({
  message = 'Loading your collection...',
}) {
  return (
    <div
      className="spinner-wrap"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="spinner" />

      <p
        style={{
          color:
            'var(--color-text-muted)',
          fontSize: '0.9rem',
          fontWeight: 500,
          margin: 0,
        }}
      >
        {message}
      </p>
    </div>
  );
}