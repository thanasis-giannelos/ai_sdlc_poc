import React from 'react';

interface Props {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const PrimaryButton: React.FC<Props> = ({
  label,
  onClick,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full px-4 py-2.5 rounded-md bg-primary text-white font-semibold text-sm
      hover:bg-primary-hover transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center justify-center gap-2 ${className}`}
  >
    {loading && (
      <span
        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
        aria-hidden="true"
      />
    )}
    {label}
  </button>
);
