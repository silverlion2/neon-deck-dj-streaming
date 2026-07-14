/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          900: "#05050C",
          800: "#0A0A18",
          700: "#0F0F22",
          600: "#15152E",
          500: "#1C1C3A",
        },
        neon: {
          magenta: "#FF2D95",
          cyan: "#00F0FF",
          lime: "#B6FF3C",
          gold: "#FFC53D",
          violet: "#9D4EDD",
        },
      },
      fontFamily: {
        display: ['"Orbitron"', "sans-serif"],
        wave: ['"Audiowide"', "cursive"],
        body: ['"Rajdhani"', "sans-serif"],
      },
      boxShadow: {
        "neon-magenta": "0 0 12px rgba(255,45,149,0.55), 0 0 28px rgba(255,45,149,0.25)",
        "neon-cyan": "0 0 12px rgba(0,240,255,0.55), 0 0 28px rgba(0,240,255,0.25)",
        "neon-lime": "0 0 12px rgba(182,255,60,0.55), 0 0 28px rgba(182,255,60,0.25)",
        panel: "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 40px rgba(0,0,0,0.55)",
      },
      keyframes: {
        beat: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        floatUp: {
          "0%": { transform: "translateY(0) scale(0.6)", opacity: "0" },
          "15%": { opacity: "1" },
          "100%": { transform: "translateY(-220px) scale(1.2)", opacity: "0" },
        },
        burst: {
          "0%": { transform: "scale(0.2) rotate(0deg)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "scale(1.6) rotate(20deg)", opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        slideIn: {
          "0%": { transform: "translateX(40px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        beat: "beat 0.5s ease-in-out infinite",
        marquee: "marquee 18s linear infinite",
        "float-up": "floatUp 2.2s ease-out forwards",
        burst: "burst 0.7s ease-out forwards",
        scan: "scan 6s linear infinite",
        blink: "blink 1s ease-in-out infinite",
        "spin-slow": "spinSlow 4s linear infinite",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
