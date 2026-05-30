export type Language = "es" | "en";

export const defaultLanguage: Language = "es";

export const dictionary = {
  es: {
    account: "Cuenta",
    analysis: "Análisis",
    analysisDescription: "Cruces, banderas de continuidad y validaciones editoriales.",
    bootstrapReady: "Listo",
    characters: "Personajes",
    charactersDescription: "Relaciona perfiles, apariciones y cambios relevantes.",
    closeMenu: "Cerrar menu",
    comingSoon: "Proxima fase",
    comingSoonBody:
      "Aqui dejaremos el espacio para la funcionalidad real cuando avancemos a los modulos CRUD y de analisis.",
    events: "Eventos",
    eventsDescription: "Ordena escenas, hechos canon y dependencias narrativas.",
    exportImport: "Exportar / importar",
    exportImportDescription:
      "Prepara respaldos, intercambio de datos y paquetes portables.",
    homeDescription:
      "Abre un proyecto para revisar personajes, eventos, locaciones, timeline y señales de continuidad.",
    homeTitle: "Continuity Tracker",
    language: "Idioma",
    locations: "Locaciones",
    locationsDescription: "Centraliza lugares, reglas internas y notas visuales.",
    moduleGridBody:
      "Accesos directos a las areas principales del proyecto.",
    moduleGridTitle: "Areas de trabajo",
    modules: "Modulos",
    openMenu: "Abrir menu",
    openProjects: "Abrir proyectos",
    pleaseWait: "Espera un momento...",
    projects: "Proyectos",
    projectsDescription: "Configura universos, series o clientes con sus reglas base.",
    shellCardBody:
      "Navegacion lateral, layout estable y area principal.",
    shellCardTitle: "Aplicacion",
    shellIntro:
      "Base de trabajo para controlar continuidad narrativa, personajes, eventos y analisis editorial.",
    stackCardBody:
      "Herramientas internas del proyecto.",
    stackCardTitle: "Sistema",
    signOut: "Salir",
    timeline: "Línea de tiempo",
    timelineDescription: "Visualiza secuencias, orden temporal y conflictos de canon.",
    workspace: "Espacio de trabajo",
    workspaceName: "Continuity Tracker / Base",
  },
  en: {
    account: "Account",
    analysis: "Analysis",
    analysisDescription: "Cross-checks, continuity flags, and editorial validation.",
    bootstrapReady: "Ready",
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
      "Open a project to review characters, events, locations, timeline, and continuity signals.",
    homeTitle: "Continuity Tracker",
    language: "Language",
    locations: "Locations",
    locationsDescription: "Centralize places, internal rules, and visual notes.",
    moduleGridBody:
      "Shortcuts to the main project areas.",
    moduleGridTitle: "Work areas",
    modules: "Modules",
    openMenu: "Open menu",
    openProjects: "Open projects",
    pleaseWait: "Please wait...",
    projects: "Projects",
    projectsDescription: "Configure universes, series, or clients with base rules.",
    shellCardBody:
      "Sidebar navigation, a stable layout, and the main workspace.",
    shellCardTitle: "Application",
    shellIntro:
      "Working foundation for tracking narrative continuity, characters, events, and editorial analysis.",
    stackCardBody:
      "Internal project tools.",
    stackCardTitle: "System",
    signOut: "Sign out",
    timeline: "Timeline",
    timelineDescription: "Visualize sequences, time order, and canon conflicts.",
    workspace: "Workspace",
    workspaceName: "Continuity Tracker / Bootstrap",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)[typeof defaultLanguage];
