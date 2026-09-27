/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary-ch) / <alpha-value>)',
          hover: 'var(--color-primary-hover)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary-ch) / <alpha-value>)',
          ink: 'var(--color-secondary-ink)',
        },
        pop: 'var(--color-pop)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
        danger: {
          DEFAULT: 'rgb(var(--color-danger-ch) / <alpha-value>)',
        },
        border: 'var(--color-border)',
      },
      fontFamily: {
        display: ['Montserrat Variable', 'Montserrat', 'sans-serif'],
        sans: ['Varta', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem', // cards (design system: 14px)
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}
