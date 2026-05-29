# Fase 02: Autenticacion local

## Objetivo
Agregar usuario y contrasena para que cada usuario pueda crear y ver sus propios proyectos.

## Decisiones
- Registro abierto local.
- Login con email y contrasena.
- Contrasenas hasheadas con `bcryptjs`.
- Sesion local mediante cookie `HttpOnly`.
- Sin OAuth, recuperacion de contrasena ni roles en el MVP.

## Modelo de datos
Agregar en Prisma:

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  sessions     Session[]
  projects     Project[]
}

model Session {
  id        String   @id @default(cuid())
  tokenHash String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Tareas
1. Crear `prisma/schema.prisma` con datasource SQLite y generator Prisma Client.
2. Crear helpers:
   - `lib/auth/password.ts`
   - `lib/auth/session.ts`
   - `lib/auth/current-user.ts`
3. Crear acciones o route handlers para:
   - registro
   - login
   - logout
4. Crear pantallas:
   - `/login`
   - `/register`
5. Proteger rutas internas:
   - si no hay sesion valida, redirigir a `/login`
   - si hay sesion valida, mostrar app shell
6. Mostrar usuario actual y boton de salir en la UI.
7. Invalidar sesiones expiradas de forma oportunista al consultar usuario actual.

## Validaciones minimas
- Email requerido y con formato basico.
- Nombre requerido.
- Contrasena minima de 8 caracteres.
- Error claro si el email ya existe.
- Error claro si login falla.

## Criterios de aceptacion
- Un usuario puede registrarse.
- Un usuario puede iniciar sesion.
- Un usuario puede cerrar sesion.
- Rutas internas no se ven sin sesion.
- La cookie de sesion no expone el token en JavaScript.

## Notas para futuras sesiones
- La importacion y los seeds deben crear datos asociados a un usuario.
- Todas las consultas futuras deben filtrar por `ownerId` o usuario actual.
