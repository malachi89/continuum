import { cookies } from "next/headers";
import {
  defaultLanguage,
  dictionary,
  isLanguage,
  languageCookieName,
  type Language,
  type TranslationKey,
} from "@/lib/i18n/dictionary";

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const savedLanguage = cookieStore.get(languageCookieName)?.value;

  return isLanguage(savedLanguage) ? savedLanguage : defaultLanguage;
}

export async function getServerTranslations() {
  const language = await getServerLanguage();

  return {
    language,
    t: (key: TranslationKey) => dictionary[language][key],
  };
}
