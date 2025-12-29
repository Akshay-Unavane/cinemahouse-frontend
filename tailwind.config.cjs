/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '/public/index.html',
  ],
  theme: {
    extend: {
      colors:{
        base: "#0F172A",
        neon: "#00FFFF",
        glass: "rgba(255, 255, 255, 0.1)",
      },
      boxShadow:{
        neon: "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF, 0 0 40px #00FFFF",
      },
      backgroundImage: {
        "gradiant-radial": "linear-gradient(135deg, #0F172A 0%, #1e293b 100%)",
      }
    },
  },
  plugins: [],
}
