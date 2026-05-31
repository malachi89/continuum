# Continuum

Continuum es un MVP para seguimiento de continuidad narrativa. Permite gestionar proyectos privados por usuario, personajes, locaciones y eventos, visualizarlos en timeline, detectar inconsistencias de canon y mover datos con import/export JSON.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- SQLite
- Vitest
- Zod
- `@dnd-kit/core`

## Instalacion

```powershell
npm install
```

## Variables de entorno

El proyecto esta configurado actualmente para usar SQLite dentro de `prisma/dev.db`.

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Migracion

```powershell
npx prisma migrate dev
```

Si Prisma falla por tipos o cliente desactualizado:

```powershell
npx prisma generate
```

## Seed

```powershell
npx prisma db seed
```

## Demo para admin

Para cargar dos proyectos de muestra en la cuenta `admin`:

```powershell
npm run seed:admin-showcase
```

Eso crea o refresca estos proyectos:

- `Guardia de Fin de Semana`
- `La Caravana de las Ratas de Andrómeda`

La cuenta queda lista para entrar como `admin` / `admin` o `admin@continuity.local` / `admin`.

## Correr la app

```powershell
npm run dev
```

## Pruebas

```powershell
npm test
```

## Build

```powershell
npm run build
```

## Credenciales demo

```text
demo@continuity.local
continuity123
```

## Funcionalidades del MVP

- Autenticacion con sesiones locales.
- CRUD completo de proyectos, personajes, locaciones y eventos.
- Timeline por proyecto con filtros y drag and drop de personajes a eventos.
- Tracking individual por personaje.
- Motor puro de analisis de continuidad.
- Import/export JSON por proyecto.

## Flujo recomendado desde cero

1. Instala dependencias con `npm install`.
2. Verifica `DATABASE_URL` en `.env`.
3. Crea o sincroniza la base con `npx prisma migrate dev`.
4. Si hace falta, regenera cliente con `npx prisma generate`.
5. Carga datos demo con `npx prisma db seed`.
6. Inicia la app con `npm run dev`.
7. Abre login con las credenciales demo.

## Verificacion final

```powershell
npm test
npm run build
git status --short --branch
```
