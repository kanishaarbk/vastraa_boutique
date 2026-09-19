import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({
  quantity,
  max,
  onChange,
  disabled = false,
}) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="qty-stepper">
      <button
        type="button"
        className="qty-btn"
        onClick={handleDecrement}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>

      <span
        className="qty-display"
        aria-label={`Quantity ${quantity}`}
      >
        {quantity}
      </span>

      <button
        type="button"
        className="qty-btn"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}