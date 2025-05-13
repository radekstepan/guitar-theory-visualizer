/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: { // Add custom colors used if they are not standard Tailwind colors
        // Example: 'brand-blue': '#007ace',
      }
    },
  },
  plugins: [],
}
