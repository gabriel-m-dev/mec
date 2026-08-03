import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./sanity/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      opacity: {
        4: "0.04",
        6: "0.06",
        8: "0.08",
      },
      colors: {
        ink: {
          950: "#02050c",
          900: "#07111d",
          800: "#0f1c2d",
        },
        gold: {
          50: "#fff9ec",
          100: "#fdf0ca",
          200: "#f8dea0",
          300: "#f0c76b",
          400: "#e3aa35",
          500: "#c88a14",
          600: "#a86d10",
        },
      },
      boxShadow: {
        luxe: "0 0 0 1px rgba(240,199,107,0.18), 0 20px 80px rgba(0,0,0,0.55)",
        glow: "0 0 40px rgba(227,170,53,0.18)",
      },
      backgroundImage: {
        "gold-radial":
          "radial-gradient(circle at top, rgba(227,170,53,0.22), transparent 50%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        floaty: "floaty 8s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
