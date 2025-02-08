import type { Config } from "tailwindcss";

import tailwindcss_animate from "tailwindcss-animate";

const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/@lumeweb/portal-framework-core/src/components/**/*.{js,jsx,ts,tsx}",
    "node_modules/@lumeweb/portal-framework-ui/src/**/*.{js,jsx,ts,tsx}",
    "node_modules/@lumeweb/portal-framework-ui-core/src/**/*.{js,jsx,ts,tsx}",
    "node_modules/@lumeweb/portal-framework-auth/src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ["class"],
  plugins: [tailwindcss_animate],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderWidth: {
        1: "1px",
      },
      colors: {
        "accent": {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        "background": "hsl(var(--background))",
        "border": "hsl(var(--border))",
        "card": {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "destructive": {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        "foreground": "hsl(var(--foreground))",
        "input": {
          DEFAULT: "hsl(var(--input))",
          placeholder: "hsl(var(--input-placeholder))",
        },
        "muted": {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        "popover": {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        "primary": {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        "primary-1": {
          DEFAULT: "hsl(var(--primary-1))",
          foreground: "hsl(var(--primary-1-foreground))",
        },
        "primary-2": {
          DEFAULT: "hsl(var(--primary-2))",
        },
        "primary-dark": {
          DEFAULT: "hsl(var(--primary-dark))",
        },
        "ring": "hsl(var(--ring))",
        "secondary": {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        "secondary-1": {
          DEFAULT: "hsl(var(--secondary-1))",
          foreground: "hsl(var(--secondary-1-foreground))",
        },
        "upload-file-background": "hsla(48, 100%, 74%, 1)",
      },
      fontFamily: {
        sans: ["Manrope Variable", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
} satisfies Config;

export default config;
