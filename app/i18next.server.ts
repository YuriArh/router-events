import Backend from "i18next-http-backend";
import { RemixI18Next } from "remix-i18next/server";
import i18n from "~/i18n"; // your i18n configuration file

let i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
  },
  // Configure backend
  i18next: {
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  backend: Backend,
});

export default i18next;
