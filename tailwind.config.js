/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Shippori Mincho", "serif"],
        sans: ["Noto Sans JP", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          900: "#0a0a0a",
          800: "#171717",
          700: "#262626",
          600: "#404040",
          500: "#737373",
        },
        accent: {
          500: "#f97316",
          600: "#ea580c",
        },
        moss: {
          500: "#22c55e",
          600: "#16a34a",
        },
        paper: "#f6f3ef",
        night: "#0b1220"
      },
      boxShadow: {
        card: "0 14px 30px -18px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};
