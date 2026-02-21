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
          950: "#111827",
          900: "#1f2937",
          800: "#374151",
          700: "#4b5563",
          600: "#6b7280",
          500: "#9ca3af",
          200: "#e5e7eb",
          100: "#f3f4f6",
          50: "#f9fafb",
        },
        accent: {
          500: "#36c48e",
          600: "#2bac7d",
        },
        moss: {
          500: "#36c48e",
          600: "#2bac7d",
        },
        mint: {
          50: "#f5fbf8",
          100: "#ebf6f1",
          200: "#d9ebe4",
          300: "#c7ddd5",
          400: "#aed0c5",
          500: "#8fbbaa",
        },
        paper: "#f8fafa",
        night: "#111827"
      },
      boxShadow: {
        card: "0 18px 45px -28px rgba(17, 24, 39, 0.45)",
      },
    },
  },
  plugins: [],
};
