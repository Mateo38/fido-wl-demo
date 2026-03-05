import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import nl from './locales/nl.json';

export const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  de: 'de-DE',
  nl: 'nl-NL',
};

const savedLang = localStorage.getItem('wl-bank-lang') || 'fr';

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    de: { translation: de },
    nl: { translation: nl },
  },
  lng: savedLang,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('wl-bank-lang', lng);
});

export default i18n;
