import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        panel: {
          DEFAULT: '#1e1e2d',
          light: '#ffffff',
        },
        surface: {
          DEFAULT: '#151521',
          light: '#f4f7fe',
        },
        sidebar: {
          DEFAULT: '#0f0f15',
          light: '#ffffff',
        },
        accent: {
          pink: '#ff4b91',
          coral: '#ff9068',
          purple: '#8E54E9',
          blue: '#4776E6',
        },
        muted: {
          DEFAULT: '#92929f',
          light: '#a3aed0',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        window: '30px',
        card: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
