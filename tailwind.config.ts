import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "death-knight": {
          DEFAULT: "#C41E3A",
          muted: "#C41E3A66",
        },
        "demon-hunter": {
          DEFAULT: "#A330C9",
          muted: "#A330C966",
        },
        druid: {
          DEFAULT: "#FF7C0A",
          muted: "#FF7C0A66",
        },
        evoker: {
          DEFAULT: "#33937F",
          muted: "#33937F66",
        },
        hunter: {
          DEFAULT: "#AAD372",
          muted: "#AAD37266",
        },
        mage: {
          DEFAULT: "#3FC7EB",
          muted: "#3FC7EB66",
        },
        monk: {
          DEFAULT: "#00FF98",
          muted: "#00FF9866",
        },
        paladin: {
          DEFAULT: "#F48CBA",
          muted: "#F48CBA66",
        },
        priest: {
          DEFAULT: "#FFFFFF",
          muted: "#FFFFFF66",
        },
        rogue: {
          DEFAULT: "#FFF468",
          muted: "#FFF46866",
        },
        shaman: {
          DEFAULT: "#0070DD",
          muted: "#0070DD66",
        },
        warlock: {
          DEFAULT: "#8788EE",
          muted: "#8788EE66",
        },
        warrior: {
          DEFAULT: "#C69B6D",
          muted: "#C69B6D66",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
