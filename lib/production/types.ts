export type ProductionCatalogItem = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
};

export type PropWithAssignments = ProductionCatalogItem & {
  category: string | null;
  imageUrl: string | null;
  eventCount: number;
  characterCount: number;
};

export type AssignmentChip = {
  id: string;
  name: string;
  notes: string | null;
};

export type CharacterVisualState = {
  props: AssignmentChip[];
  makeup: AssignmentChip[];
  wardrobe: AssignmentChip[];
  hairstyles: AssignmentChip[];
};

export type EventCharacterProductionState = {
  characterId: string;
  characterName: string;
  characterColor: string;
  visual: CharacterVisualState;
};

export type EventProductionState = {
  eventId: string;
  sceneProps: AssignmentChip[];
  characters: EventCharacterProductionState[];
};
