# AGENTS.md

## Project

Continuum is a Next.js MVP for narrative continuity tracking. It supports private projects per user, characters, locations, events, project timelines, character tracking, continuity analysis, and JSON import/export.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7 with SQLite
- Vitest
- Zod
- `@dnd-kit/core`

## Common Commands

```powershell
npm run dev
npm run lint
npm test
npm run build
```

Use `npm run lint`, `npm test`, and `npm run build` before handing off meaningful code changes.

## Local Data

The app uses SQLite via `DATABASE_URL`, normally pointing at `prisma/dev.db`.

Useful Prisma commands:

```powershell
npx prisma migrate dev
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
- `components/projects/TimelineBoard.tsx`: timeline UI, filters, drag and drop character assignment.
- `components/forms/`: project, character, location, event, import, and delete forms.
- `lib/continuity/`: data access, timeline helpers, analysis engine, import/export, constants, navigation.
- `lib/i18n/`: language provider and dictionary.
- `prisma/schema.prisma`: core project, character, location, event, and event-character models.
- `tests/`: Vitest coverage for continuity helpers, auth, dictionary, analysis, and distance logic.

## Working Rules

- Keep UI copy direct and app-like. Avoid phase language, roadmap copy, marketing-style text, and implementation-status messaging in the product UI.
- Prefer existing server actions and data helpers over adding API routes.
- Keep project ownership checks on all server-side data mutations.
- For event-character assignment, preserve the existing behavior: drag characters onto existing events; do not create events from drag and drop.
- Keep continuity analysis logic pure where possible and cover behavior with Vitest.
- Do not commit generated logs such as `next-dev*.log`, `npm-dev*.log`, `npm-start*.log`, or `server-run*.log`.
