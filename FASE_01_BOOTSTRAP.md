# Fase 01: Bootstrap del proyecto

## Objetivo
Crear la base tecnica de Continuity Tracker en la rama `dev`, con Next.js, TypeScript, Tailwind CSS, Prisma, SQLite, Vitest y la estructura inicial de carpetas.

## Estado inicial esperado
- Repositorio en `C:\Users\malch\Documents\continuum`.
- Rama de trabajo: `dev`.
- Proyecto vacio salvo `README.md`, `.gitignore` y estos documentos de fases.

## Decisiones
- Stack: Next.js App Router, React, TypeScript, Tailwind CSS, Prisma + SQLite.
- Package manager: npm.
- UI: herramienta de produccion, compacta, clara y bilingue simple ES/EN.
- No se implementa autenticacion en esta fase, solo se prepara el shell.

## Tareas
1. Verificar rama:
   ```powershell
   git status --short --branch
   ```
2. Crear el proyecto Next.js en la raiz actual sin crear subcarpeta adicional.
3. Instalar dependencias principales:
   ```powershell
   npm install @prisma/client bcryptjs @dnd-kit/core @dnd-kit/utilities clsx zod lucide-react
   npm install -D prisma vitest @vitejs/plugin-react jsdom @types/bcryptjs
   ```
4. Configurar Tailwind CSS segun la version instalada por Next.
5. Crear estructura base:
   ```text
   app/
   components/
   lib/
   lib/i18n/
   lib/continuity/
   prisma/
   tests/
   ```
6. Crear un layout base con navegacion lateral o superior:
   - Proyectos
   - Personajes
   - Locaciones
   - Eventos
   - Timeline
   - Analisis
   - Exportar/importar
7. Agregar toggle ES/EN guardado en `localStorage`.
8. Actualizar `.gitignore` para:
   - `.next/`
   - `node_modules/`
   - `coverage/`
   - `.env`
   - `prisma/dev.db`
   - `prisma/dev.db-journal`

## Archivos clave esperados
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `components/AppShell.tsx`
- `lib/i18n/dictionary.ts`
- `lib/i18n/LanguageProvider.tsx`
- `vitest.config.ts`

## Criterios de aceptacion
- `npm install` termina sin errores.
- `npm run dev` levanta la app localmente.
- La pantalla inicial muestra el shell de Continuity Tracker.
- El selector ES/EN cambia textos basicos y persiste al recargar.
- `npm run build` llega al menos hasta el punto previo a depender de Prisma real.

## Notas para futuras sesiones
- Mantener todo en la rama `dev`.
- No implementar pantallas CRUD completas aqui; esta fase solo deja el esqueleto firme.
