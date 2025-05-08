/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-light": "rgb(var(--color-primary-light) / <alpha-value>)",
        "primary-dark": "rgb(var(--color-primary-dark) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-light": "rgb(var(--color-secondary-light) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        neutral: "rgb(var(--color-neutral) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: ["Playfair Display", "serif"],
        display: ["Playfair Display", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-up": "slideInUp 0.3s ease-out",
      },
      boxShadow: {
        card: "0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
        "card-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        premium: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
        "premium-hover": "0 10px 30px 0 rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        premium: "0.75rem",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, rgb(28, 52, 84) 0%, rgb(45, 85, 137) 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, rgb(184, 134, 11) 0%, rgb(212, 175, 55) 100%)",
        "gradient-accent":
          "linear-gradient(135deg, rgb(28, 52, 84) 0%, rgb(142, 85, 114) 100%)",
        "gradient-dark":
          "linear-gradient(135deg, rgb(16, 32, 52) 0%, rgb(28, 52, 84) 100%)",
      },
    },
  },
  plugins: [],
};
