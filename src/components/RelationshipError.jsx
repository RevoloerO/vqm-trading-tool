import { memo } from 'react';

function RelationshipError({ message }) {
  if (!message) return null;

  return (
    <div className="relationship-error">
      <span className="field-error">{message}</span>
    </div>
  );
}

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(RelationshipError);
