import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NavBar } from './components/NavBar';
import { ErrorBoundary } from './components/ErrorBoundary';

// Catalog exposes its full App (no internal router — just renders ProductListPage).
const CatalogApp  = React.lazy(() => import('catalogRemote/CatalogApp'));

// Cart and Account expose individual page components so the host owns routing.
// Their App.tsx files keep their own BrowserRouter for standalone dev on ports 3002/3003.
const CartPage    = React.lazy(() => import('cartRemote/CartPage').then((m) => ({ default: m.CartPage })));
const LoginPage   = React.lazy(() => import('accountRemote/LoginPage').then((m) => ({ default: m.LoginPage })));
const AccountPage = React.lazy(() => import('accountRemote/AccountPage').then((m) => ({ default: m.AccountPage })));

const queryClient = new QueryClient();

const RemoteFallback: React.FC<{ name: string }> = ({ name }) => (
  <div className="flex min-h-[400px] items-center justify-center">
    <p className="text-sm text-neutral-500">Loading {name}…</p>
  </div>
);

const Remote: React.FC<{ name: string; children: React.ReactNode }> = ({ name, children }) => (
  <ErrorBoundary name={name}>
    <Suspense fallback={<RemoteFallback name={name} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-neutral-50 flex flex-col">
          <NavBar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/catalog" replace />} />

              <Route
                path="/catalog/*"
                element={
                  <Remote name="Catalog">
                    <CatalogApp />
                  </Remote>
                }
              />

              <Route
                path="/cart"
                element={
                  <Remote name="Cart">
                    <CartPage />
                  </Remote>
                }
              />

              <Route
                path="/login"
                element={
                  <Remote name="Account">
                    <LoginPage />
                  </Remote>
                }
              />

              <Route
                path="/account/*"
                element={
                  <Remote name="Account">
                    <AccountPage />
                  </Remote>
                }
              />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
