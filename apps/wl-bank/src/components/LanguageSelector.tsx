import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'fr', flag: '\ud83c\uddeb\ud83c\uddf7', label: 'FR' },
  { code: 'en', flag: '\ud83c\uddec\ud83c\udde7', label: 'EN' },
  { code: 'de', flag: '\ud83c\udde9\ud83c\uddea', label: 'DE' },
  { code: 'nl', flag: '\ud83c\uddf3\ud83c\uddf1', label: 'NL' },
];

export function LanguageSelector({ variant = 'sidebar' }: { variant?: 'sidebar' | 'login' }) {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-1">
      {languages.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            i18n.language === code
              ? variant === 'login'
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'bg-violet-500/20 text-violet-300'
              : variant === 'login'
                ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                : 'text-slate-500 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="text-base leading-none">{flag}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
