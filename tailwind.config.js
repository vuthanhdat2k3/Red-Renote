/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF3B30",
          dark: "#8B0000",
          soft: "#FF6A3D",
        },
        app: {
          background: "#F7F7F8",
          surface: "#FFFFFF",
          text: "#111111",
          muted: "#656B76",
          border: "#E6E8EC",
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
