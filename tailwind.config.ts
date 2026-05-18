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
        sidebar: {
          bg: "#0C0C0C",
          hover: "#181818",
          active: "#161616",
          border: "#1E1E1E",
          text: "#606060",
          "text-active": "#F0F0F0",
          "text-muted": "#383838",
        },
        cream: {
          DEFAULT: "#F7F5F0",
          50: "#FAF8F4",
          100: "#EEEAE0",
          200: "#DDDACF",
        },
        brand: {
          DEFAULT: "#0066CC",
          light: "#3B9EFF",
          dark: "#004C99",
        },
        card: "#FFFFFF",
        ink: {
          DEFAULT: "#111111",
          muted: "#6B6860",
          faint: "#9B978E",
        },
        status: {
          green: "#1E7D4E",
          orange: "#C47800",
          red: "#C62020",
          "green-bg": "#F0FDF6",
          "orange-bg": "#FFFBEB",
          "red-bg": "#FFF0F0",
          "blue-bg": "#EFF6FF",
          blue: "#2563EB",
        },
      },
      fontFamily: {
        sans: ["var(--font-ibm)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
