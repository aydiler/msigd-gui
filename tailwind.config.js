/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{svelte,js,ts}"],
  theme: {
    extend: {
      colors: {
        // MSI-inspired color palette
        msi: {
          red: "#ff0000",
          dark: "#111827",
          darker: "#0a0f1a",
        },
      },
    },
  },
  plugins: [],
};
