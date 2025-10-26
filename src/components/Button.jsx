import React from 'react';

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

export default Button;
