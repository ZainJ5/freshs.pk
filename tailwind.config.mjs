/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50:  '#f4f9ed',
          100: '#e6f2d6',
          200: '#cfe6b0',
          300: '#aed47e',
          400: '#8fbf54',
          500: '#689537',
          600: '#547a2c',
          700: '#3f5e22',
          800: '#2d4419',
          900: '#1b350c',
          950: '#0e1d06',
        },
      },
    },
  },
  plugins: [],
};
