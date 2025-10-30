import { memo } from 'react';

function Button({ children, onClick, variant = "primary", disabled = false, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      <span className="btn-text">{children}</span>
    </button>
  );
}

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(Button);
