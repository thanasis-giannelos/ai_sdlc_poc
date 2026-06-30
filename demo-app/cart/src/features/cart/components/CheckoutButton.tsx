import React, { useState } from 'react';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';

export const CheckoutButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // POC stub — simulates a checkout initiation then resets
  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <PrimaryButton
      label={loading ? 'Processing…' : 'Proceed to Checkout'}
      loading={loading}
      onClick={handleCheckout}
    />
  );
};
