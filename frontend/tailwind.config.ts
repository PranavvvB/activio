import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: { 50: "#fff5f2", 100: "#ffe7e1", 500: "#ef765f", 600: "#dc614b" },
        cream: "#fcfaf6",
        ink: "#25233b",
        indigo: { 50: "#f1f1ff", 100: "#e5e5ff", 500: "#6865d8", 600: "#5552c4" }
      },
      fontFamily: { sans: ["var(--font-sans)"], display: ["var(--font-display)"] },
      boxShadow: { soft: "0 18px 50px rgba(37, 35, 59, 0.08)" }
    }
  },
  plugins: []
};
export default config;
