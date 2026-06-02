"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export function CharacterPopover({
  label,
  characters,
  projectId,
}: {
  label: string;
  characters: { characterId: string; character: { name: string; color: string } }[];
  projectId: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer border-b border-dotted border-muted/40 text-ink transition hover:border-accent"
      >
        {label}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-[14px] border border-line bg-surface p-3 shadow-[0_18px_50px_rgba(91,71,36,0.18)]">
          <div className="space-y-2">
            {characters.map((link) => (
              <div
                key={link.characterId}
                className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-canvas/80 px-2 py-1 text-[0.7rem]"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: link.character.color }}
                />
                <Link
                  href={`/projects/${projectId}/characters/${link.characterId}`}
                  className="min-w-0 flex-1 truncate font-medium text-ink hover:text-accent"
                >
                  {link.character.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
