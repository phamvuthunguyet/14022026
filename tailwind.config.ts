import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        space: {
          950: "#0a0a12",
          900: "#0f0f1a",
          800: "#16162a",
          700: "#1e1e35",
        },
        star: {
          dim: "#6b7a9e",
          soft: "#a8b8e0",
          bright: "#e8ecff",
          glow: "#c4d4ff",
        },
      },
      animation: {
        twinkle: "twinkle 3s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
