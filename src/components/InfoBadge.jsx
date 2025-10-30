import { memo } from 'react';

function InfoBadge({ message, variant = "success" }) {
  if (!message) return null;

  return (
    <div className={`info-badge ${variant}`}>
      {message}
    </div>
  );
}

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(InfoBadge);
