import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./resources";

const DEFAULT_LANGUAGE = "en";

const getDefaultLanguage = () => {
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang) return savedLang;
    return navigator.language.split("-")[0];
  }
  return DEFAULT_LANGUAGE;
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDefaultLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  ns: ["translations"],
  defaultNS: "translations",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
