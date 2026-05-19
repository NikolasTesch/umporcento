/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  // Cores dos hábitos (§4.3) vivem em src/theme/cores.ts como strings literais
  // e são detectadas pelo scan de conteúdo acima — não precisam de safelist.
  plugins: [],
};
