import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tes couleurs du thème "Suédois"
        swedish: {
          white: "#fefefe",
          cream: "#f9f7f2",
          sage: "#4a634e",     // Foncé (Accessibilité OK)
          blue: "#2c5282",     // Foncé (Accessibilité OK)
          grey: "#e5e3df",
          charcoal: "#1a1a1a", // Texte
          wood: "#8c5e3c",     // Bordures
        },
      },
    },
  },
  plugins: [],
};
export default config;