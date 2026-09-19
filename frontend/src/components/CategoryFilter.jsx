import React from 'react';

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <div className="category-filter-bar">
      <button
        type="button"
        className={`category-pill ${!selectedCategory ? 'active' : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        All Collections
      </button>

      {categories.map((cat) => {
        const isSelected =
          selectedCategory === cat.slug ||
          selectedCategory === String(cat.id) ||
          selectedCategory === cat.name;

        return (
          <button
            key={cat.id}
            type="button"
            className={`category-pill ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.slug || cat.id)}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}