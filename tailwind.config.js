/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './App.{js,jsx,ts,tsx}',
      './src/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
      extend: {
        colors: {
          // PoultryCo Brand Colors
          primary: {
            DEFAULT: '#2B7A4B', // PoultryCo Green
            light: '#3A9B5F',
            dark: '#1F5736',
          },
          cream: '#F8F6F0',
          navy: '#1E3A5F',
          orange: '#E67E22',
          brown: '#8D6E3B',
        },
        fontFamily: {
          // Add Inter and Poppins fonts
          inter: ['Inter', 'sans-serif'],
          poppins: ['Poppins', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };