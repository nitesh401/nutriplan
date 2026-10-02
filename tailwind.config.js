/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#14211C',
        chalk: '#F2F5F3',
        pith: '#DCE6E0',
        leaf: '#2E7D55',
        beet: '#B5395B',
        saffron: '#D9922B',
        berry: '#3F5FA8',
        warn: '#B4452F',
      },
    },
  },
};
