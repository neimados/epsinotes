// /i18n.ts
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

const i18n = new I18n();

i18n.translations = {
  en,
  es,
  fr,
};

i18n.locale = Localization.getLocales()[0]?.languageCode || 'en';

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;