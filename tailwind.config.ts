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
        ink: {
          50: "#F4F6F8",
          100: "#E8ECF1",
          200: "#C9D2DC",
          300: "#9AABBC",
          400: "#6B8299",
          500: "#4A6278",
          600: "#334556",
          700: "#243140",
          800: "#17202A",
          900: "#0E151C",
          950: "#080C10",
        },
        teal: {
          DEFAULT: "#0F766E",
          bright: "#14B8A6",
          soft: "#CCFBF1",
        },
        sand: "#F6F1E8",
        clay: "#E8D9C5",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 21, 28, 0.06), 0 8px 24px rgba(14, 21, 28, 0.06)",
        lift: "0 12px 32px rgba(14, 21, 28, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
