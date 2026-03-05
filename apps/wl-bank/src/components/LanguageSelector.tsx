import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'fr', flag: '\ud83c\uddeb\ud83c\uddf7', label: 'FR' },
  { code: 'en', flag: '\ud83c\uddec\ud83c\udde7', label: 'EN' },
  { code: 'de', flag: '\ud83c\udde9\ud83c\uddea', label: 'DE' },
  { code: 'nl', flag: '\ud83c\uddf3\ud83c\uddf1', label: 'NL' },
];

export function LanguageSelector({ variant = 'sidebar' }: { variant?: 'sidebar' | 'login' }) {
  const { i18n } = useTranslation();

  const className = variant === 'login'
    ? 'w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer'
    : 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer';

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className={className}
    >
      {languages.map(({ code, flag, label }) => (
        <option key={code} value={code} className="bg-slate-900 text-white">
          {flag} {label}
        </option>
      ))}
    </select>
  );
}
