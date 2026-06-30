import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './shared/lib/queryClient';
import { CartPage } from './pages/CartPage';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Routes>
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  </QueryClientProvider>
);

export default App;
