import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Hero } from './Hero';

const THEMES = [
  ['apple', 'Apple'],
  ['alpine-glass', 'Alpine Glass'],
  ['field-journal', 'Field Journal'],
  ['solaris', 'Solaris'],
  ['midnight-observatory', 'Midnight Observatory'],
  ['coastal-forecast', 'Coastal Forecast'],
  ['storm-signal', 'Storm Signal'],
  ['nordic-minimal', 'Nordic Minimal'],
  ['retro-station', 'Retro Weather Station'],
  ['citrus-pop', 'Citrus Pop'],
  ['urban-grid', 'Urban Grid'],
  ['cloud-atlas', 'Cloud Atlas'],
  ['monsoon-garden', 'Monsoon Garden'],
  ['paper-almanac', 'Paper Almanac'],
  ['aurora-night', 'Aurora Night'],
  ['instrument-panel', 'Instrument Panel'],
] as const;

const STORAGE_KEY = 'weather-starter-theme';

export function Layout() {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return THEMES.some(([id]) => id === saved) ? saved! : 'apple';
  });

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="flex h-full min-h-screen w-full">
      <Sidebar />
      <Hero />
      <label className="theme-picker fixed right-4 top-4 z-[1100] flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium shadow-lg backdrop-blur-xl sm:right-6 sm:top-5">
        <span>Theme</span>
        <select
          aria-label="Choose visual theme"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
          className="max-w-36 cursor-pointer bg-transparent text-inherit outline-none"
        >
          {THEMES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>
    </div>
  );
}
