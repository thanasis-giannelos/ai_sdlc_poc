import React from 'react';

interface Props {
  label: string;
  href: string;
  className?: string;
}

export const LinkButton: React.FC<Props> = ({ label, href, className = '' }) => (
  <a
    href={href}
    className={`text-sm text-primary hover:text-primary-hover underline-offset-2 hover:underline transition-colors ${className}`}
  >
    {label}
  </a>
);
