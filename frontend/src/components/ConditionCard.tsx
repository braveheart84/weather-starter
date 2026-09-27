import { CloudIcon, DropletIcon, SunIcon } from './icons';
import { formatTime } from './format';
import type { WeatherSnapshot } from '../types';

interface ConditionCardProps {
  area: string;
  weather: WeatherSnapshot;
}

function conditionIcon(condition: string) {
  const text = condition.toLowerCase();
  if (/thunder|rain|shower/.test(text)) {
    return <DropletIcon className="h-8 w-8 text-sky-200" />;
  }
  if (/fair|sun|clear/.test(text)) {
    return <SunIcon className="h-8 w-8 text-amber-200" />;
  }
  return <CloudIcon className="h-8 w-8 text-white/90" />;
}

export function ConditionCard({ area, weather }: ConditionCardProps) {
  const condition = weather.condition || 'Conditions unavailable';
  const observed = formatTime(weather.observed_at);

  return (
    <section
      aria-label={`Two-hour forecast for ${area}`}
      className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 text-left shadow-lg shadow-black/10 backdrop-blur-xl"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
        {conditionIcon(condition)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
          2-hour forecast
        </div>
        <div className="mt-1 text-xl font-medium leading-tight text-white">{condition}</div>
        {weather.valid_period_text && (
          <p className="mt-1 text-sm text-white/70">{weather.valid_period_text}</p>
        )}
        {observed && <p className="mt-2 text-xs text-white/45">Updated {observed}</p>}
      </div>
    </section>
  );
}
