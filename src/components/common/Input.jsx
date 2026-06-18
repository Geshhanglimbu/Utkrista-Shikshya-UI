import React from 'react';

export const Input = ({ 
  label, 
  icon: Icon, 
  error, 
  action: Action,
  className = '', 
  ...props 
}) => {
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label">{label}</label>}
      <div className={`input-wrap ${error ? 'input-wrap--error' : ''}`}>
        {Icon && <span className="input-wrap__icon">{Icon}</span>}
        <input {...props} />
        {Action && <div className="input-wrap__action">{Action}</div>}
      </div>
      {error && (
        <div className="field__error">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
};
