import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          base: "var(--glass-base)",
          elevated: "var(--glass-elevated)",
          pill: "var(--glass-pill)",
        },
        accent: {
          blue: "var(--accent-blue)",
          green: "var(--accent-green)",
          amber: "var(--accent-amber)",
          red: "var(--accent-red)",
        },
      },
      borderRadius: {
        glass: "20px",
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
        "glass-elevated": "var(--glass-shadow-elevated)",
      },
    },
  },
  plugins: [],
};

export default config;
