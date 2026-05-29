export type Language = "es" | "en";

export const defaultLanguage: Language = "es";

export const dictionary = {
  es: {
    account: "Cuenta",
    analysis: "Analisis",
    analysisDescription: "Cruces, banderas de continuidad y chequeos editoriales.",
    bootstrapReady: "Base tecnica lista para crecer",
    characters: "Personajes",
    charactersDescription: "Relaciona perfiles, apariciones y cambios relevantes.",
    closeMenu: "Cerrar menu",
    comingSoon: "Proxima fase",
    comingSoonBody:
      "Aqui dejaremos el espacio para la funcionalidad real cuando avancemos a los modulos CRUD y de analisis.",
    events: "Eventos",
    eventsDescription: "Ordena escenas, hechos canon y dependencias narrativas.",
    exportImport: "Exportar/importar",
    exportImportDescription:
      "Prepara respaldos, intercambio de datos y paquetes portables.",
    homeDescription:
      "El shell inicial ya separa las areas clave del tracker, lista el stack base y deja listo el punto de partida para autenticacion, modelo de datos y CRUD.",
    homeTitle: "Continuity Tracker arranca con una estructura clara y bilingue.",
    language: "Idioma",
    locations: "Locaciones",
    locationsDescription: "Centraliza lugares, reglas internas y notas visuales.",
    moduleGridBody:
      "Cada modulo ya tiene su entrada y una pagina placeholder para que la siguiente fase se enfoque en comportamiento, no en estructura.",
    moduleGridTitle: "Mapa inicial del producto",
    modules: "Modulos",
    openMenu: "Abrir menu",
    openProjects: "Abrir proyectos",
    pleaseWait: "Espera un momento...",
    projects: "Proyectos",
    projectsDescription: "Configura universos, series o clientes con sus reglas base.",
    shellCardBody:
      "Navegacion lateral, layout estable y area principal lista para crecer por modulo.",
    shellCardTitle: "Shell de aplicacion",
    shellIntro:
      "Base de trabajo para controlar continuidad narrativa, personajes, eventos y analisis editorial.",
    stackCardBody:
      "Next.js, TypeScript, Tailwind, Prisma, SQLite y Vitest quedaron conectados desde el primer paso.",
    stackCardTitle: "Stack preparado",
    signOut: "Salir",
    timeline: "Timeline",
    timelineDescription: "Visualiza secuencias, orden temporal y conflictos de canon.",
    workspace: "Workspace",
    workspaceName: "Continuity Tracker / Bootstrap",
  },
  en: {
    account: "Account",
    analysis: "Analysis",
    analysisDescription: "Cross-checks, continuity flags, and editorial validation.",
    bootstrapReady: "Technical foundation ready to grow",
    characters: "Characters",
    charactersDescription: "Track profiles, appearances, and relevant changes.",
    closeMenu: "Close menu",
    comingSoon: "Next phase",
    comingSoonBody:
      "This area is reserved for the real module behavior once we move into CRUD and analysis work.",
    events: "Events",
    eventsDescription: "Sort scenes, canon facts, and narrative dependencies.",
    exportImport: "Export / import",
    exportImportDescription:
      "Prepare backups, data exchange, and portable packages.",
    homeDescription:
      "The initial shell already separates the key tracker areas, lists the base stack, and leaves a clean starting point for auth, data modeling, and CRUD.",
    homeTitle: "Continuity Tracker starts with a clear bilingual structure.",
    language: "Language",
    locations: "Locations",
    locationsDescription: "Centralize places, internal rules, and visual notes.",
    moduleGridBody:
      "Each module already has an entry point and a placeholder page, so the next phase can focus on behavior instead of structure.",
    moduleGridTitle: "Initial product map",
    modules: "Modules",
    openMenu: "Open menu",
    openProjects: "Open projects",
    pleaseWait: "Please wait...",
    projects: "Projects",
    projectsDescription: "Configure universes, series, or clients with base rules.",
    shellCardBody:
      "Sidebar navigation, a stable layout, and a main area ready to grow per module.",
    shellCardTitle: "Application shell",
    shellIntro:
      "Working foundation for tracking narrative continuity, characters, events, and editorial analysis.",
    stackCardBody:
      "Next.js, TypeScript, Tailwind, Prisma, SQLite, and Vitest are wired in from the first step.",
    stackCardTitle: "Prepared stack",
    signOut: "Sign out",
    timeline: "Timeline",
    timelineDescription: "Visualize sequences, time order, and canon conflicts.",
    workspace: "Workspace",
    workspaceName: "Continuity Tracker / Bootstrap",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)[typeof defaultLanguage];
