/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {},
    theme: {
      colors: {
        color0: "#052e16", //teal
        color1: "#14532d", // light teal
        color2: "#f1f5f9", // light gray
      },
    },
  },
  plugins: [],
};

