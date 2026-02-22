import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          bg: "#0a1628",
          surface: "#0d2137",
          card: "rgba(15, 50, 80, 0.6)",
          border: "rgba(45, 212, 191, 0.25)",
          teal: "#0d9488",
          tealLight: "#14b8a6",
          cyan: "#2dd4bf",
          muted: "#94a3b8",
          text: "#f1f5f9",
        },
      },
      backdropBlur: {
        glass: "12px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
