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
          bg: "#14171A",
          hover: "#1A1E22",
          active: "#0D1929",
          border: "#23272B",
          text: "#94a3b8",
          "text-active": "#93c5fd",
          "text-muted": "#4B5568",
        },
        cream: {
          DEFAULT: "#FAFAF7",
          50: "#F7F5F0",
          100: "#F2F2EC",
          200: "#E4E4DC",
        },
        brand: {
          DEFAULT: "#0078D4",
          light: "#2B88D8",
          dark: "#005A9E",
        },
        card: "#FFFFFF",
        ink: {
          DEFAULT: "#14171A",
          muted: "#5B6268",
          faint: "#8A9096",
        },
        status: {
          green: "#10b981",
          orange: "#f59e0b",
          red: "#ef4444",
          "green-bg": "#d1fae5",
          "orange-bg": "#fef3c7",
          "red-bg": "#fee2e2",
          "blue-bg": "#dbeafe",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
