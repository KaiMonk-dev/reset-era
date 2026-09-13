/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0F",
        panel: "#14141B",
        line: "#26262F",
        ember: "#FF5A1F",
        gold: "#FFB930",
      },
      fontFamily: {
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
};
