import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./ui/**/*.{ts,tsx}", "./professions/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213D",
        "ink-soft": "#3B4A63",
        paper: "#FAF8F3",
        "paper-raised": "#FFFFFF",
        hairline: "#D8D2C2",
        brass: "#A9782F",
        "brass-deep": "#8A5F22",
        forest: "#2F5D45",
        oxblood: "#8C3A2B",
        slate: "#0F1B2E",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        arabic: ["Noto Serif Arabic", "serif"],
        body: ["IBM Plex Sans", "-apple-system", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: { DEFAULT: "3px", sm: "2px", md: "4px" },
    },
  },
  plugins: [],
};

export default config;
