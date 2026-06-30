import React from 'react';

export const Footer: React.FC = () => (
  <footer className="py-6 px-4 border-t border-neutral-200 text-center">
    <p className="text-sm text-neutral-500">© 2026 MiniStore. All rights reserved.</p>
    <nav className="flex justify-center gap-4 mt-2" aria-label="Footer navigation">
      <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Privacy</a>
      <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Terms</a>
      <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Contact</a>
    </nav>
  </footer>
);
