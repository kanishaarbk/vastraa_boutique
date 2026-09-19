import React from 'react';
import {
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function ErrorMessage({
  message,
  onRetry,
}) {
  return (
    <div
      style={{
        background:
          'var(--color-danger-bg)',
        border:
          '1px solid #FECACA',
        borderRadius:
          'var(--radius-lg)',
        padding:
          '1.25rem 1.5rem',
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent:
          'space-between',
        gap: '1rem',
      }}
      role="alert"
    >
      {/* Error Message */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <AlertCircle
          size={20}
          color="var(--color-danger)"
          style={{
            flexShrink: 0,
          }}
        />

        <span
          style={{
            color:
              'var(--color-danger)',
            fontSize: '0.92rem',
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {message ||
            'Something went wrong. Please try again.'}
        </span>
      </div>

      {/* Retry */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-sm btn-secondary"
          style={{
            flexShrink: 0,
            gap: '0.35rem',
          }}
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}