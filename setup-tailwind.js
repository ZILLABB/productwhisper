const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create tailwind.config.js
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 10px 30px 0 rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'premium': '0.75rem',
      },
    },
  },
  plugins: [],
}`;

// Create postcss.config.js
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

// Write files
fs.writeFileSync(path.join(__dirname, 'tailwind.config.js'), tailwindConfig);
fs.writeFileSync(path.join(__dirname, 'postcss.config.js'), postcssConfig);

console.log('Tailwind CSS configuration files created successfully!');

// Install dependencies if needed
try {
  console.log('Installing Tailwind CSS and dependencies...');
  execSync('npm install -D tailwindcss postcss autoprefixer', { stdio: 'inherit' });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
}

console.log('Setup complete! Restart your development server to apply changes.');
