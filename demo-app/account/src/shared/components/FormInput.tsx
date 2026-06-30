import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface Props {
  label: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  autoComplete?: string;
  registration?: UseFormRegisterReturn;
}

export const FormInput: React.FC<Props> = ({
  label,
  type = 'text',
  error,
  disabled = false,
  placeholder,
  id,
  autoComplete,
  registration,
}) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-neutral-900">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`px-3 py-2 rounded-sm border text-sm text-neutral-900 bg-white
          placeholder:text-neutral-500
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:bg-neutral-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? 'border-danger' : 'border-neutral-200'}`}
        {...registration}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
