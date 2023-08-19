/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/flowbite/**/*.js',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#ff7600',
        'primary-orange-light': '#ffa600',
        'light-gray': '#EDF0F2',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};
