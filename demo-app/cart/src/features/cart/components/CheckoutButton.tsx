import React, { useState } from 'react';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { useCartStore } from '../hooks/useCartStore';

export const CheckoutButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const clearCart = useCartStore((s) => s.clearCart);

  // POC stub — simulates a checkout initiation then clears cart
  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => {
      clearCart();
      setLoading(false);
    }, 1500);
  };

  return (
    <PrimaryButton
      label={loading ? 'Processing…' : 'Proceed to Checkout'}
      loading={loading}
      onClick={handleCheckout}
    />
  );
};
