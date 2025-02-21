/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6a1b9a',
        link: '#42a5f5',
        info: '#9ccc65',
        success: '#66bb6a',
        warning: '#ffeb3b',
        danger: '#ef5350',
        light: '#f5f5f5',
        dark: '#424242',
      },
    },
  },
  plugins: [],
}