import type { Config } from "tailwindcss";

/**
 * Arma un color de Tailwind que lee de una variable CSS guardada como
 * canales RGB ("2 5 12", ver `app/globals.css`), y que además sabe
 * responder a los modificadores de opacidad (`bg-ink-950/50`). Sin este
 * envoltorio, pasarle `var(--ink-950)` directo a Tailwind rompe justo esas
 * clases: Tailwind necesita los canales sueltos para construir
 * `rgb(var(...) / 50%)`, no puede partir un color ya armado.
 */
function withOpacity(variable: string): string {
  // Tailwind SÍ soporta esta forma función en runtime — así resuelve
  // `bg-ink-950/50` — pero su tipo declarado para `theme.colors` solo admite
  // `string`. El cast es acá, en un único lugar, para no repetirlo en cada
  // color de la paleta.
  return ((({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined
      ? `rgb(var(${variable}))`
      : `rgb(var(${variable}) / ${opacityValue})`) as unknown) as string;
}

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
      // Los valores reales viven en `app/globals.css` (`:root`), como
      // `--font-sans`/`--font-serif` unas líneas más abajo. Cambiar un color
      // de la marca es tocar esa variable UNA vez: acá y en cualquier CSS a
      // mano que la use quedan sincronizados solos.
      colors: {
        ink: {
          950: withOpacity("--ink-950"),
          900: withOpacity("--ink-900"),
          800: withOpacity("--ink-800"),
        },
        gold: {
          50: withOpacity("--gold-50"),
          100: withOpacity("--gold-100"),
          200: withOpacity("--gold-200"),
          300: withOpacity("--gold-300"),
          400: withOpacity("--gold-400"),
          500: withOpacity("--gold-500"),
          600: withOpacity("--gold-600"),
        },
      },
      boxShadow: {
        luxe: "0 0 0 1px rgb(var(--gold-300) / 0.18), 0 20px 80px rgba(0,0,0,0.55)",
        glow: "0 0 40px rgb(var(--gold-400) / 0.18)",
      },
      backgroundImage: {
        "gold-radial":
          "radial-gradient(circle at top, rgb(var(--gold-400) / 0.22), transparent 50%)",
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
