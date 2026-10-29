const config = {
  plugins: {
    // Inlines src/styles/brand.css so Tailwind processes its @layer / @apply rules.
    "postcss-import": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
