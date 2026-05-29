# Fase 07: Import/export, pruebas y documentacion

## Objetivo
Cerrar el MVP con exportacion/importacion JSON, pruebas unitarias y README completo para instalar, correr, sembrar datos y probar.

## Import/export
Ruta:
```text
/projects/[projectId]/import-export
```

Exportar:
- proyecto actual
- personajes
- locaciones
- eventos
- relaciones evento-personaje

Importar:
- recibir JSON
- validar estructura basica con `zod`
- crear una copia nueva del proyecto para el usuario actual
- no sobrescribir proyectos existentes
- mostrar errores claros si falta estructura requerida

## Forma JSON minima
```json
{
  "project": {},
  "characters": [],
  "locations": [],
  "events": [],
  "eventCharacters": []
}
```

## Pruebas unitarias
Usar Vitest para:
- Haversine entre Ciudad de Mexico y Tokio.
- Deteccion de eventos traslapados.
- Deteccion de viaje imposible.
- Evento con hora final anterior a hora inicial.
- Personaje muerto en escena posterior.
- Excepcion de flashback/sueno/vision para personaje muerto.
- Hash/verify de contrasena.

## README
Actualizar `README.md` con:
- descripcion de la app
- stack
- instalacion:
  ```powershell
  npm install
  ```
- `.env`:
  ```env
  DATABASE_URL="file:./dev.db"
  ```
- migracion:
  ```powershell
  npx prisma migrate dev
  ```
- seed:
  ```powershell
  npx prisma db seed
  ```
- correr app:
  ```powershell
  npm run dev
  ```
- pruebas:
  ```powershell
  npm test
  ```
- build:
  ```powershell
  npm run build
  ```
- credenciales demo:
  ```text
  demo@continuity.local
  continuity123
  ```

## Verificacion final
Ejecutar:
```powershell
npm test
npm run build
git status --short --branch
```

## Criterios de aceptacion
- Exportar descarga o muestra JSON valido del proyecto.
- Importar crea un proyecto nuevo propiedad del usuario autenticado.
- Todas las pruebas unitarias pasan.
- Build de Next pasa.
- README permite a una futura sesion o persona correr el proyecto desde cero.

## Notas para futuras sesiones
- Si el build falla por tipos generados de Prisma, regenerar con `npx prisma generate`.
- Evitar dependencias de red en tests.
