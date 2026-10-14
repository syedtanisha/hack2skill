/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF9F6',
          100: '#F5F4F0',
          200: '#EBE9E1',
          300: '#DDD9CD',
        },
        sage: {
          50: '#F2F7F4',
          100: '#E4EDE7',
          200: '#C8DBD0',
          300: '#9CBFA7',
          400: '#6FA37E',
          500: '#4A7C59',
          600: '#3D6649',
          700: '#2F5039',
          800: '#223A2A',
          900: '#17271C',
        },
        coral: {
          50: '#FDF6F4',
          100: '#FBECE8',
          200: '#F7D6CD',
          300: '#F0B3A3',
          400: '#E78E77',
          500: '#E07A5F',
          600: '#C76349',
          700: '#A74E37',
          800: '#873B28',
          900: '#682A1B',
        },
        charcoal: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
