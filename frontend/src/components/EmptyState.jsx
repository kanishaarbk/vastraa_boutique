import React from 'react';
import { PackageOpen, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No styles found',
  description = 'Try adjusting your filters or search terms to discover more beautiful styles.',
  actionText,
  actionLink,
  onAction,
  icon: Icon = ShoppingBag,
}) {
  return (
    <div className="empty-state">
      <Icon className="empty-icon" />

      <h3 className="empty-title">
        {title}
      </h3>

      <p className="empty-desc">
        {description}
      </p>

      {actionLink && (
        <Link
          to={actionLink}
          className="btn btn-primary"
        >
          {actionText}
        </Link>
      )}

      {onAction && !actionLink && (
        <button
          onClick={onAction}
          className="btn btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}