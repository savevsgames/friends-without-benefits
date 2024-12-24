/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}",
    "./index.html",
  ],
  darkMode: ["selector", '[data-mode="dark"]'], // tailwind doesnt support class anymore
  plugins: [],
  theme: {
    extend: {},
  },
};
