import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'fr', flag: '\ud83c\uddeb\ud83c\uddf7', label: 'Fran\u00e7ais' },
  { code: 'en', flag: '\ud83c\uddec\ud83c\udde7', label: 'English' },
  { code: 'de', flag: '\ud83c\udde9\ud83c\uddea', label: 'Deutsch' },
  { code: 'nl', flag: '\ud83c\uddf3\ud83c\uddf1', label: 'Nederlands' },
];

export function LanguageSelector({ variant = 'sidebar' }: { variant?: 'sidebar' | 'login' }) {
  const { i18n } = useTranslation();

  const className = variant === 'login'
    ? 'w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer'
    : 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer';

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className={className}
    >
      {languages.map(({ code, flag, label }) => (
        <option key={code} value={code}>
          {flag} {label}
        </option>
      ))}
    </select>
  );
}
