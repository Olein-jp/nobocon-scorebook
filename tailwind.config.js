/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Plus Jakarta Sans", "Noto Sans JP", "system-ui", "sans-serif"],
        sans: ["Noto Sans JP", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "rgb(var(--color-text-strong) / <alpha-value>)",
          900: "rgb(var(--color-text) / <alpha-value>)",
          800: "rgb(var(--color-text-soft) / <alpha-value>)",
          700: "rgb(var(--color-text-muted) / <alpha-value>)",
          600: "rgb(var(--color-text-faint) / <alpha-value>)",
          500: "rgb(var(--color-text-subtle) / <alpha-value>)",
          200: "rgb(var(--color-line-soft) / <alpha-value>)",
          100: "rgb(var(--color-surface-2) / <alpha-value>)",
          50: "rgb(var(--color-surface-1) / <alpha-value>)",
        },
        accent: {
          500: "rgb(var(--color-accent) / <alpha-value>)",
          600: "rgb(var(--color-accent-strong) / <alpha-value>)",
        },
        moss: {
          500: "rgb(var(--color-accent) / <alpha-value>)",
          600: "rgb(var(--color-accent-strong) / <alpha-value>)",
        },
        mint: {
          50: "rgb(var(--color-surface-1) / <alpha-value>)",
          100: "rgb(var(--color-surface-2) / <alpha-value>)",
          200: "rgb(var(--color-surface-3) / <alpha-value>)",
          300: "rgb(var(--color-line) / <alpha-value>)",
          400: "rgb(var(--color-line-strong) / <alpha-value>)",
          500: "rgb(var(--color-accent-soft) / <alpha-value>)",
        },
        paper: "rgb(var(--color-surface-1) / <alpha-value>)",
        night: "rgb(var(--color-bg) / <alpha-value>)",
      },
      boxShadow: {
        card: "0 28px 50px -30px rgba(0, 0, 0, 0.72)",
      },
    },
  },
  plugins: [],
};
