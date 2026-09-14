import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#49BBBD",
          dark: "#2D9B9D",
          pale: "#E8F7F7",
        },
        orange: {
          DEFAULT: "#F48C06",
          soft: "#FFA53A",
        },
        navy: {
          DEFAULT: "#2F327D",
          deep: "#252641",
        },
        muted: "#696984",
        peach: "#FFF3E4",
        paper: "#F8F8F8",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 60px rgba(47, 50, 125, 0.08)",
      },
      borderRadius: {
        pill: "80px",
      },
    },
  },
  plugins: [],
} satisfies Config;
