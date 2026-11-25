import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu';
import useTheme, { setTheme } from '../../hooks/useTheme';

const options = [
  { value: 'system', label: 'Match my device', icon: LuMonitor },
  { value: 'light', label: 'Light theme', icon: LuSun },
  { value: 'dark', label: 'Dark theme', icon: LuMoon },
];

/** Theme switch: device, light or dark. The new theme spreads out from the button pressed (see setTheme). */
const ThemeToggle = ({ className = '' }) => {
  const { choice } = useTheme();

  return (
    <div role="group" aria-label="Theme" className={`flex rounded-full border border-white/15 p-0.5 ${className}`}>
      {options.map(({ value, label, icon: Icon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              setTheme(value, { x: box.left + box.width / 2, y: box.top + box.height / 2 });
            }}
            className={`flex size-8 items-center justify-center rounded-full transition-colors duration-200 ${
              active ? 'bg-accent/25 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Icon aria-hidden className="size-4" />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
