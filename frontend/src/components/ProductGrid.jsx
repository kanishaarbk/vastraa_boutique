import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

export default function ProductGrid({
  products,
  emptyTitle = 'No styles found',
  emptyDescription =
    'Try adjusting your search or category filters to discover more beautiful styles.',
  onResetFilters,
}) {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}