import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "6px",
      md: "6px",
      lg: "8px",
      xl: "12px",
      "2xl": "16px",
      "3xl": "24px",
      full: "9999px",
      glass: "8px",
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background)",
          muted: "var(--background-muted)",
        },
        foreground: "var(--foreground)",
        muted: "var(--text-muted)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          hover: "var(--surface-hover)",
        },
        glass: {
          base: "var(--glass-base)",
          elevated: "var(--glass-elevated)",
          pill: "var(--glass-pill)",
        },
        accent: {
          primary: "var(--accent-primary)",
          blue: "var(--accent-blue)",
          highlight: "var(--accent-highlight)",
          indigo: "var(--accent-indigo)",
          green: "var(--accent-green)",
          amber: "var(--accent-amber)",
          red: "var(--accent-red)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
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
