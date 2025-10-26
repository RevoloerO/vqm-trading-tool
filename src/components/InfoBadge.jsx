import React from 'react';

function InfoBadge({ message, variant = "success" }) {
  if (!message) return null;

  return (
    <div className={`info-badge ${variant}`}>
      {message}
    </div>
  );
}

export default InfoBadge;
