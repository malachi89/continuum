# AGENTS.md

## Project

Continuum is a Next.js MVP for narrative continuity tracking. It supports private projects per user, characters, locations, events, project timelines, character tracking, continuity analysis, JSON import/export, and production tracking for props plus character visual state (makeup, wardrobe, hairstyle).

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7 with SQLite
- Vitest
- Zod
- `@dnd-kit/core`
- `lucide-react`
- `bcryptjs`

## Common Commands

```powershell
npm run dev
npm run lint
npm test
npm run build
npm run seed:admin-showcase
```

Use `npm run lint`, `npm test`, and `npm run build` before handing off meaningful code changes.

## Local Data

The app uses SQLite via `DATABASE_URL`, normally pointing at `prisma/dev.db`.

Useful Prisma commands:

```powershell
npx prisma migrate dev
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

Demo login:

```text
demo@continuity.local
continuity123
```

## Code Map

- `app/(app)/projects/actions.ts`: server actions for CRUD, timeline assignment, import/export.
- `app/(app)/projects/production-actions.ts`: server actions for production catalogs and event/character production assignments.
- `app/(auth)/actions.ts`: auth server actions (register, login, logout).
- `components/AppShell.tsx`: main app layout with sidebar navigation.
- `components/forms/`: project, character, location, event, production catalog, import, and delete forms.
- `components/production/`: scene props panel and per-character production assignment panels.
- `components/projects/TimelineBoard.tsx`: timeline UI, filters, drag and drop character assignment, zoom select (hours/days/weeks/months/years/millenia), gap trimming toggle.
- `components/projects/ProjectRoutePicker.tsx`: grid of project cards linking to sections.
- `components/projects/ProjectWorkspaceNav.tsx`: sub-navigation within a project.
- `components/ui/`: reusable primitives (Button, Input, Select, Textarea, Badge, EmptyState).
- `lib/auth/`: password hashing, session management, current user helpers.
- `lib/production/`: production catalog queries, assignment helpers, and production view models.
- `lib/continuity/timeline.ts`: timeline range, histogram tracks, axis ticks, lane assignment, gap collapse (`collapseTimelineGaps`), zoom scale config (6 levels), character tracking.
- `lib/i18n/`: language provider, dictionary (es/en), server-side language detection.
- `prisma/schema.prisma`: core project, character, location, event, event-character, prop, and production-state models.
- `prisma/seed-admin-showcase.ts`: advanced seed with 2 demo projects and intentional collisions.
- `tests/`: Vitest coverage for continuity helpers, auth, dictionary, analysis, distance logic, import/export, and production actions.

## Working Rules

- Keep UI copy direct and app-like. Avoid phase language, roadmap copy, marketing-style text, and implementation-status messaging in the product UI.
- Prefer existing server actions and data helpers over adding API routes.
- Keep project ownership checks on all server-side data mutations.
- For event-character assignment, preserve the existing behavior: drag characters onto existing events; do not create events from drag and drop.
- Production catalog items are project-scoped and reusable. Character-level production assignments must stay tied to an existing `EventCharacter` link, not just loose `eventId` / `characterId` pairs.
- Keep production import/export backward compatible. Legacy bundles without production arrays must still parse cleanly.
- When editing project navigation, remember that project section links are rendered through `ProjectWorkspaceNav` inside `app/(app)/projects/[projectId]/layout.tsx`.
- Keep continuity analysis logic pure where possible and cover behavior with Vitest.
- `CHARACTER_APPEARS_WITHOUT_TRAVEL` uses a 1-day (24h) threshold: if the gap between `previousEvent.internalEnd` and `currentEvent.internalStart` is >= 24 hours, the warning is suppressed (enough time for offscreen travel). Below 24h, a TRAVEL event is expected.
- Timeline zoom has 6 levels (hours, days, weeks, months, years, millenia) defined in `TIMELINE_SCALE_CONFIG` with discrete `unitMs`, `pxPerUnit`, and `minWidth`. The zoom control is a `<Select>` dropdown that persists to localStorage.
- Gap trimming is ON by default. It collapses gaps larger than 2× the zoom unit via `collapseTimelineGaps`. The toggle button shows "Expandir/Expand" when active, "Recortar/Trim gaps" when inactive. Gap breaks render as dashed vertical lines with a duration label.
- Event detail now has a dedicated production route at `/projects/[projectId]/events/[eventId]/production`, and the project-level catalog lives at `/projects/[projectId]/production`.
- Do not commit generated logs such as `next-dev*.log`, `npm-dev*.log`, `npm-start*.log`, or `server-run*.log`.
