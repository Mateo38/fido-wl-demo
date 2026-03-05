import { useTranslation } from 'react-i18next';
import { LOCALE_MAP } from '../i18n';

export function useLocale() {
  const { i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] || 'fr-FR';

  const formatCurrency = (value: number, currency = 'EUR') =>
    value.toLocaleString(locale, { style: 'currency', currency });

  const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) =>
    new Date(date).toLocaleDateString(locale, options);

  const formatDateTime = (date: string | Date) =>
    new Date(date).toLocaleString(locale);

  return { locale, formatCurrency, formatDate, formatDateTime };
}
