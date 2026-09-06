import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F3F4F6",
        lime: {
          DEFAULT: "#C8F542",
          dim: "#B5DE2A",
          soft: "#EEF8C4",
          ink: "#1A2408",
        },
        coral: {
          DEFAULT: "#FF8A73",
          soft: "#FFE1DB",
        },
        ink: {
          50: "#F4F5F7",
          100: "#E8EAEE",
          200: "#D0D4DC",
          300: "#9AA1AE",
          400: "#6B7280",
          500: "#4B5563",
          600: "#374151",
          700: "#252A33",
          800: "#181B21",
          900: "#111318",
          950: "#0B0D11",
        },
        teal: {
          DEFAULT: "#C8F542",
          bright: "#C8F542",
          soft: "#EEF8C4",
        },
        sand: "#F3F4F6",
      },
      fontFamily: {
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 19, 24, 0.04), 0 8px 24px rgba(17, 19, 24, 0.05)",
        lift: "0 16px 40px rgba(17, 19, 24, 0.16)",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
