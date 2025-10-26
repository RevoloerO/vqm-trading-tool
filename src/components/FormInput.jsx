import React from 'react';

function FormInput({
  label,
  value,
  onChange,
  error,
  type = "number",
  placeholder,
  required = false,
  step,
  prefix,
  suffix
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-wrapper">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          type={type}
          className={`form-input ${error ? 'error' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          step={step}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default FormInput;
