import { memo } from 'react';

function ErrorMessage({ message, title = "Error" }) {
  if (!message) return null;

  return (
    <div className="results-card error">
      <h3 className="results-title">{title}</h3>
      <p className="error-message">{message}</p>
    </div>
  );
}

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(ErrorMessage);
