import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        panel: {
          DEFAULT: 'var(--card-bg)',
          light: 'var(--card-bg)',
        },
        surface: {
          DEFAULT: 'var(--input-bg)',
          light: 'var(--input-bg)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar-bg)',
          light: 'var(--sidebar-bg)',
        },
        accent: {
          pink: 'var(--accent)',
          coral: 'var(--accent-secondary)',
          purple: '#8E54E9',
          blue: '#4776E6',
        },
        muted: {
          DEFAULT: 'var(--text-muted)',
          light: 'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        window: 'var(--radius-window)',
        card: 'var(--radius-card)',
      },
    },
  },
  plugins: [],
};

export default config;
