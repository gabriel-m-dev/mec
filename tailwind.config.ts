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
      // Escala tipográfica propia, más chica que la de Tailwind. La reducción
      // es progresiva a propósito: el texto de lectura casi no baja, para no
      // comprometer la legibilidad, y los tamaños de display bajan hasta un
      // 28%, que es lo que hacía sentir la página sobredimensionada.
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1rem", { lineHeight: "1.6rem" }],
        xl: ["1.125rem", { lineHeight: "1.65rem" }],
        "2xl": ["1.3125rem", { lineHeight: "1.8rem" }],
        "3xl": ["1.5rem", { lineHeight: "1.95rem" }],
        "4xl": ["1.75rem", { lineHeight: "2.1rem" }],
        "5xl": ["2.25rem", { lineHeight: "1.1" }],
        "6xl": ["2.75rem", { lineHeight: "1.08" }],
        "7xl": ["3.25rem", { lineHeight: "1.05" }],
        "8xl": ["4rem", { lineHeight: "1.02" }],
        "9xl": ["5rem", { lineHeight: "1" }],
      },
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
