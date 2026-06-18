/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "upto-blue": "#2563EB",
        "upto-orange": "#FF6B00",
        "upto-navy": "#0A2540",
        "upto-dark": "#0B0F19",
        "upto-card": "#161B26",
        "upto-green": "#10B981",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
