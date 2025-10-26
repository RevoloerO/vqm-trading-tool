import React from 'react';

function RelationshipError({ message }) {
  if (!message) return null;

  return (
    <div className="relationship-error">
      <span className="field-error">{message}</span>
    </div>
  );
}

export default RelationshipError;
