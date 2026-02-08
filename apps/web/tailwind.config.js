/**
 * Onyx Report - Tailwind CSS Configuration
 * Complete brand integration with design tokens
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ============================================
      // COLORS
      // ============================================
      colors: {
        // Primary - Onyx Blue
        onyx: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // FCI Condition Scale
        fci: {
          good: '#10B981',
          'good-bg': '#ECFDF5',
          fair: '#F59E0B',
          'fair-bg': '#FFFBEB',
          poor: '#F97316',
          'poor-bg': '#FFF7ED',
          critical: '#EF4444',
          'critical-bg': '#FEF2F2',
        },
        // Data Visualization
        chart: {
          1: '#3B82F6',
          2: '#10B981',
          3: '#8B5CF6',
          4: '#F59E0B',
          5: '#F43F5E',
          6: '#06B6D4',
        },
      },

      // ============================================
      // TYPOGRAPHY
      // ============================================
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.025em',
        tight: '-0.02em',
      },

      // ============================================
      // SPACING
      // ============================================
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        '4xl': '2rem',
      },

      // ============================================
      // SHADOWS
      // ============================================
      boxShadow: {
        'primary': '0 4px 14px 0 rgb(37 99 235 / 0.25)',
        'success': '0 4px 14px 0 rgb(34 197 94 / 0.25)',
        'error': '0 4px 14px 0 rgb(239 68 68 / 0.25)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },

      // ============================================
      // ANIMATIONS
      // ============================================
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      // ============================================
      // TRANSITIONS
      // ============================================
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },

      // ============================================
      // Z-INDEX
      // ============================================
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'modal-backdrop': '400',
        'modal': '500',
        'popover': '600',
        'tooltip': '700',
      },

      // ============================================
      // CONTAINER
      // ============================================
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [
    // Custom plugin for FCI utility classes
    function({ addUtilities }) {
      const fciUtilities = {
        '.fci-good': {
          color: '#10B981',
          backgroundColor: '#ECFDF5',
        },
        '.fci-fair': {
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
        },
        '.fci-poor': {
          color: '#F97316',
          backgroundColor: '#FFF7ED',
        },
        '.fci-critical': {
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
        },
        '.fci-border-good': {
          borderColor: '#10B981',
        },
        '.fci-border-fair': {
          borderColor: '#F59E0B',
        },
        '.fci-border-poor': {
          borderColor: '#F97316',
        },
        '.fci-border-critical': {
          borderColor: '#EF4444',
        },
      };
      addUtilities(fciUtilities);
    },
  ],
};
