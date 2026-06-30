import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartCountStore } from '../store/cartStore';
import { useAuth } from '../context/AuthContext';

export const NavBar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartCountStore((s) => s.count);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white shadow-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-neutral-900 hover:text-primary">
          MiniStore
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 sm:flex">
          <Link to="/catalog" className="text-sm font-medium text-neutral-700 hover:text-primary">
            Catalog
          </Link>
          <Link to="/cart" className="text-sm font-medium text-neutral-700 hover:text-primary">
            Cart
          </Link>
        </nav>

        {/* Icon group */}
        <div className="flex items-center gap-3">
          {/* Cart icon with badge */}
          <button
            type="button"
            onClick={() => navigate('/cart')}
            aria-label={`Cart (${cartCount} items)`}
            className="relative rounded-md p-2 text-neutral-700 hover:bg-neutral-50 hover:text-primary"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center
                rounded-full bg-primary text-xs font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Account icon */}
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? '/account' : '/login')}
            aria-label={isAuthenticated ? 'My account' : 'Sign in'}
            className="rounded-md p-2 text-neutral-700 hover:bg-neutral-50 hover:text-primary"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-md p-2 text-neutral-700 hover:bg-neutral-50 sm:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-neutral-200 bg-white px-4 py-3 sm:hidden">
          <Link
            to="/catalog"
            className="block py-2 text-sm font-medium text-neutral-700 hover:text-primary"
            onClick={() => setMobileOpen(false)}
          >
            Catalog
          </Link>
          <Link
            to="/cart"
            className="block py-2 text-sm font-medium text-neutral-700 hover:text-primary"
            onClick={() => setMobileOpen(false)}
          >
            Cart
          </Link>
        </nav>
      )}
    </header>
  );
};
