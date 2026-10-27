import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './ru.json';
import en from './en.json';

// Выбранный язык переживает перезагрузку и прямой заход по ссылке. Пререндер и поисковики
// localStorage не видят и всегда получают русскую версию.
const LANG_KEY = 'meganom_lang';
const LANGUAGES = ['ru', 'en'];

function readSavedLanguage() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    return LANGUAGES.includes(saved) ? saved : null;
  } catch {
    // localStorage может быть недоступен (приватный режим) - остаёмся на русском
    return null;
  }
}

const initialLanguage = readSavedLanguage() ?? 'ru';

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
});

// <html lang> нужен браузеру, скринридерам и переводчикам; пререндер отдаёт lang="ru".
document.documentElement.lang = initialLanguage;

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(LANG_KEY, lng);
  } catch {
    // приватный режим: язык просто не запомнится
  }
});

export default i18n;
