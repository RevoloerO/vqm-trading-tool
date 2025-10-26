import React from 'react';

function ErrorMessage({ message, title = "Error" }) {
  if (!message) return null;

  return (
    <div className="results-card error">
      <h3 className="results-title">{title}</h3>
      <p className="error-message">{message}</p>
    </div>
  );
}

export default ErrorMessage;
