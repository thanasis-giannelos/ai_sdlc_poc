import React from 'react';
import '../index.css';
import { LoginForm } from '../features/auth';
import { Footer } from '../shared/components/Footer';

export const LoginPage: React.FC = () => (
  <div className="min-h-screen bg-neutral-50 flex flex-col">
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px] bg-white rounded-lg shadow-panel p-8">
        <LoginForm />
      </div>
    </main>
    <Footer />
  </div>
);
