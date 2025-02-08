/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  important: false,
  theme: {
    extend: {
      colors: {
        "blue-charcoal": "var(--color-blue-charcoal)",
        "body": "var(--color-gray)",
        "charcoal": "var(--color-charcoal)",
        "dark-aquamarine": "var(--color-dark-aquamarine)",
        "gradient-aqua":
          "linear-gradient(to right, var(--color-dark-aquamarine), var(--color-aquamarine))",
        "primary": "var(--color-aquamarine)",
      },
    },
    fontFamily: {
      body: '"Jaldi", sans-serif',
      display: '"JetBrains Mono", monospace',
      display2: '"IBM Plex Sans Devanagari", monospace',
      inter: '"Inter", sans-serif',
    },
  },
};
