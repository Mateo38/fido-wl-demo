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
                ? 'bg-wl-teal/20 text-wl-teal border border-wl-teal/30'
                : 'bg-wl-teal/20 text-wl-teal'
              : variant === 'login'
                ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                : 'text-white/40 hover:text-white hover:bg-white/10'
          }`}
        >
          <span className="text-base leading-none">{flag}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
