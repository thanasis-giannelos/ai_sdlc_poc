import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-hover': '#2563EB',
        danger: '#EF4444',
        success: '#22C55E',
        neutral: {
          50: '#F9FAFB',
          200: '#E5E7EB',
          500: '#6B7280',
          900: '#111827',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.1)',
        panel: '0 4px 16px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
