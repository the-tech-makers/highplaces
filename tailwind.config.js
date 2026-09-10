/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./public/**/*.html",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#fd4621',
          orangeDark: '#d93617',
          // teal: '#0f766e',
          // tealDark: '#115e59',
          // tealDeep: '#102a2b',
          teal: '#1298ad',
          tealDark: '#0b7182',
          tealDeep: '#083f4a',
          blue: '#1298ad',
          blueDark: '#0b7182',
          blueDeep: '#083f4a',
          ink: '#172033',
          muted: '#526071',
          surface: '#f8faf9',
          warm: '#fffaf5',
          border: '#dce5e3'
        }
      },

      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif'
        ],

        display: [
          'Plus Jakarta Sans',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif'
        ]
      },

      boxShadow: {
        soft: '0 20px 60px rgba(16, 42, 43, 0.10)'
      }
    }
  },
  plugins: [],
};