// tailwind.config.ts
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
        green: {
          DEFAULT: "#0abf6e",
          dark: "#07944f",
          pale: "#e8faf2",
        },
        ink: {
          DEFAULT: "#0e1117",
          soft: "#444850",
          muted: "#8a9099",
        },
        surface: "#f7f8fa",
        border: "rgba(0,0,0,0.08)",
        wa: "#25d366",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.06)",
        float: "0 8px 32px rgba(0,0,0,0.12)",
        modal: "0 24px 80px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
