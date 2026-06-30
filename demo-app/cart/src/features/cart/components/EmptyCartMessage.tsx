import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';

export const EmptyCartMessage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      {/* Cart illustration placeholder */}
      <div
        className="w-24 h-24 rounded-full bg-neutral-50 border-2 border-neutral-200 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-lg font-semibold text-neutral-900">Your cart is empty</p>
        <p className="text-sm text-neutral-500">Looks like you haven't added anything yet.</p>
      </div>

      <div className="w-48">
        <PrimaryButton label="Continue Shopping" onClick={() => navigate('/')} />
      </div>
    </div>
  );
};
