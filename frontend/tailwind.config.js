/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        text: "var(--text)",
        neon: "var(--neon)",
        cyan: "var(--cyan)",
        magenta: "var(--magenta)"
      },
      boxShadow: {
        glow: "0 0 28px rgba(0, 255, 65, 0.18)"
      }
    }
  },
  plugins: []
};
