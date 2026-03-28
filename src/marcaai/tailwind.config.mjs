/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Garante que pegue tudo dentro de src
    "./**/*.{js,ts,jsx,tsx,mdx}",    // Varredura total em todas as subpastas
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}