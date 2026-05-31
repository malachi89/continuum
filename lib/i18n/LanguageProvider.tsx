"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  defaultLanguage,
  dictionary,
  isLanguage,
  languageCookieName,
  languageStorageKey,
  type Language,
  type TranslationKey,
} from "@/lib/i18n/dictionary";

const LANGUAGE_EVENT = "continuity-language-change";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getCookieLanguage(): Language | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${languageCookieName}=([^;]+)`),
  );
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;

  return isLanguage(value) ? value : null;
}

function getStoredLanguage(): Language {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }

  const savedLanguage = window.localStorage.getItem(languageStorageKey);
  const cookieLanguage = getCookieLanguage();

  return isLanguage(savedLanguage)
    ? savedLanguage
    : cookieLanguage ?? defaultLanguage;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(LANGUAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LANGUAGE_EVENT, handleChange);
  };
}

export function LanguageProvider({
  children,
  initialLanguage = defaultLanguage,
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const language = useSyncExternalStore(
    subscribe,
    getStoredLanguage,
    () => initialLanguage,
  );

  const setLanguage = (nextLanguage: Language) => {
    window.localStorage.setItem(languageStorageKey, nextLanguage);
    document.cookie = `${languageCookieName}=${encodeURIComponent(nextLanguage)}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: (key) => dictionary[language][key],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
