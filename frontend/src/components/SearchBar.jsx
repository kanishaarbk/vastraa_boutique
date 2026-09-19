import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search sarees, salwar sets, kurtis...',
}) {
  return (
    <div className="search-input-wrap">
      <Search
        className="search-icon"
        size={18}
      />

      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search fashion collection"
      />

      {value && (
        <button
          type="button"
          className="clear-search-btn"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}