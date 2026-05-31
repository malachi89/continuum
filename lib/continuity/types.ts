export type ContinuitySeverity = "ERROR" | "WARNING" | "NOTE";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type AnalyzableProject = {
  id: string;
  title: string;
  type: string;
  characters: AnalyzableCharacter[];
  locations: AnalyzableLocation[];
  events: AnalyzableEvent[];
};

export type AnalyzableCharacter = {
  id: string;
  name: string;
  alias: string | null;
  color: string;
  status: string;
  statusDateInternal: string | null;
};

export type AnalyzableLocation = {
  id: string;
  name: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
};

export type AnalyzableEvent = {
  id: string;
  title: string;
  eventType: string;
  description: string | null;
  chapterOrEpisode: string | null;
  narrativeOrder: number | null;
  internalStart: string;
  internalEnd: string;
  startLocationId: string | null;
  endLocationId: string | null;
  characterIds: string[];
};

export type ContinuityResult = {
  severity: ContinuitySeverity;
  code: string;
  characterId?: string;
  eventIds: string[];
  explanation: string;
  suggestedFix: string;
};
