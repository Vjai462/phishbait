import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono: ["Syne Mono", "monospace"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        void: "#0A0A14",
        surface: "#111120",
        card: "#1A1A2E",
        danger: "#FF3B3B",
        safe: "#00C878",
        points: "#FFB800",
        info: "#4D9FFF",
      },
    },
  },
  plugins: [],
};

export default config;
