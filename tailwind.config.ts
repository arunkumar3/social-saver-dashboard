import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#111111",
          2: "#1A1A1A",
          3: "#222222",
        },
        brand: {
          blue: "#3B82F6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
