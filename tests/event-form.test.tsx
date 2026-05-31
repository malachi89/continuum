import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EventCharacterSelector } from "@/components/forms/EventForm";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

describe("EventCharacterSelector", () => {
  const characters = [
    { id: "char-1", name: "Ada", color: "#aa0000" },
    { id: "char-2", name: "Bruno", color: "#00aa00" },
    { id: "char-3", name: "Cleo", color: "#0000aa" },
  ];

  it("renders selected characters as hidden form fields", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLanguage="es">
        <EventCharacterSelector
          characters={characters}
          initialSelectedCharacterIds={["char-1", "char-3"]}
        />
      </LanguageProvider>,
    );

    expect(html).toContain('name="characterIds"');
    expect(html).toContain('value="char-1"');
    expect(html).toContain('value="char-3"');
    expect(html).not.toContain('value="char-2"');
  });

  it("keeps unknown initial character ids out of the submitted fields", () => {
    const html = renderToStaticMarkup(
      <LanguageProvider initialLanguage="es">
        <EventCharacterSelector
          characters={characters}
          initialSelectedCharacterIds={["char-2", "missing-character"]}
        />
      </LanguageProvider>,
    );

    expect(html).toContain('value="char-2"');
    expect(html).not.toContain('value="missing-character"');
  });
});
