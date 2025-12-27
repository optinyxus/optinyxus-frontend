/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'main-bg': '#F5F6FA',
        'card-bg': '#FFFFFF',
        'primary-text': '#111827',
        'secondary-text': '#4B5563',
        'muted-text': '#6B7280',
        'border-gray': '#E5E7EB',
        'hover-gray': '#F3F4F6',
        'chart-green': '#10B981',
        'brand-dark': '#1F2937',
        'brand-darker': '#111827',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-light': 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(249, 250, 251, 0.6) 0%, rgba(243, 244, 246, 0.3) 100%)',
      },
      boxShadow: {
        'premium': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'premium-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
