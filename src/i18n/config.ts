import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

// Retrieve persisted language or default to Spanish
const savedLanguage = localStorage.getItem('i18nextLng') || 'es';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es }
        },
        lng: savedLanguage,
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
