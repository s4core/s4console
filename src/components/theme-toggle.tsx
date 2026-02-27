'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('s4_theme');
    const isDark = stored ? stored === 'dark' : true;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('s4_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <label className="relative inline-block w-[46px] h-[24px] cursor-pointer">
      <input
        type="checkbox"
        checked={!dark}
        onChange={toggle}
        className="sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-[var(--input-bg)] flex items-center justify-between px-1 transition-colors">
        <span className="text-[10px] leading-none z-[1]">&#9728;</span>
        <span className="text-[10px] leading-none z-[1]">&#9790;</span>
      </span>
      <span
        className={`absolute bottom-[3px] left-[3px] w-[18px] h-[18px] bg-[var(--accent)] rounded-full z-[2] transition-transform duration-300 ${
          !dark ? 'translate-x-[22px]' : ''
        }`}
      />
    </label>
  );
}
