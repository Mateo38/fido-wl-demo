import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'nl', label: 'NL' },
];

function Flag({ code, className = 'w-5 h-4' }: { code: string; className?: string }) {
  const flags: Record<string, JSX.Element> = {
    fr: (
      <svg viewBox="0 0 640 480" className={className}>
        <rect width="213.3" height="480" fill="#002395" />
        <rect x="213.3" width="213.4" height="480" fill="#fff" />
        <rect x="426.7" width="213.3" height="480" fill="#ed2939" />
      </svg>
    ),
    en: (
      <svg viewBox="0 0 640 480" className={className}>
        <rect width="640" height="480" fill="#012169" />
        <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#fff" />
        <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
        <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#fff" />
        <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
      </svg>
    ),
    de: (
      <svg viewBox="0 0 640 480" className={className}>
        <rect width="640" height="160" fill="#000" />
        <rect y="160" width="640" height="160" fill="#D00" />
        <rect y="320" width="640" height="160" fill="#FFCE00" />
      </svg>
    ),
    nl: (
      <svg viewBox="0 0 640 480" className={className}>
        <rect width="640" height="160" fill="#AE1C28" />
        <rect y="160" width="640" height="160" fill="#fff" />
        <rect y="320" width="640" height="160" fill="#21468B" />
      </svg>
    ),
  };
  return flags[code] || null;
}

export function LanguageSelector({ variant = 'sidebar' }: { variant?: 'sidebar' | 'login' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  const btnClass = variant === 'login'
    ? 'w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 cursor-pointer hover:border-gray-600 transition-colors'
    : 'w-full flex items-center justify-between bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 cursor-pointer hover:border-white/20 transition-colors';

  const menuClass = variant === 'login'
    ? 'absolute left-0 right-0 bottom-full mb-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg z-50'
    : 'absolute left-0 right-0 bottom-full mb-1 bg-wl-dark border border-white/10 rounded-lg overflow-hidden shadow-lg z-50';

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className={btnClass}>
        <span className="flex items-center gap-2">
          <Flag code={current.code} />
          {current.label}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={menuClass}>
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => { i18n.changeLanguage(code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                i18n.language === code
                  ? 'bg-wl-teal/20 text-wl-teal'
                  : variant === 'login' ? 'text-gray-300 hover:bg-gray-700' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Flag code={code} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
