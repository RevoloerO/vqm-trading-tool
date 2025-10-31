import { memo, forwardRef } from 'react';

const FormInput = forwardRef(({
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
}, ref) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-wrapper">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          ref={ref}
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
});

FormInput.displayName = 'FormInput';

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(FormInput);
