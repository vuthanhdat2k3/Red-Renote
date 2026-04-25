/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#E50914",
          dark: "#8B0000",
          soft: "#FF6B6B",
        },
        app: {
          background: "#FAFAFA",
          surface: "#FFFFFF",
          text: "#111111",
          muted: "#6B7280",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        card: "16px",
        control: "14px",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(17, 17, 17, 0.06)",
      },
    },
  },
  plugins: [],
};
