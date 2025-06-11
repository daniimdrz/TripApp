/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#4A90E2',   // Azul principal
        accent: '#FF6F61',    // Rojo suave para botones destacados
        neutral: '#F5F5F5',    // Fondo neutro
        'neutral-dark': '#333333', // Texto oscuro
      },
      borderRadius: {
        'xl': '12px',         // Esquinas redondeadas consistentes
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.1)', // Sombras para tarjetas
      },
      spacing: {
        '72': '18rem',       // Para imágenes grandes (ej: 200px)
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Estilos personalizados para formularios
  ],
}

