import { describe, expect, it } from "vitest";
import { defaultLanguage, dictionary } from "@/lib/i18n/dictionary";

describe("dictionary", () => {
  it("keeps matching keys in both languages", () => {
    const baseKeys = Object.keys(dictionary[defaultLanguage]).sort();
    const englishKeys = Object.keys(dictionary.en).sort();

    expect(englishKeys).toEqual(baseKeys);
  });
});
