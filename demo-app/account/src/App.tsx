import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './shared/lib/queryClient';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/account/*" element={<AccountPage />} />
    </Routes>
  </QueryClientProvider>
);

export default App;
