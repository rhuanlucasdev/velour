/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#121212",
        card: "#1C1C1C",
        accent: "#7C5CFF",
        border: "rgba(255,255,255,0.06)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "card-hover":
          "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(124,92,255,0.08)",
      },
    },
  },
  plugins: [],
};
