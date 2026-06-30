import React from 'react';

interface Props {
  message: string;
}

export const ErrorMessage: React.FC<Props> = ({ message }) => (
  <p className="text-sm text-danger mt-1" role="alert">
    {message}
  </p>
);
