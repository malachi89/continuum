-- CreateTable
CREATE TABLE "Prop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prop_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventProp" (
    "eventId" TEXT NOT NULL,
    "propId" TEXT NOT NULL,
    "notes" TEXT,
    PRIMARY KEY ("eventId", "propId"),
    CONSTRAINT "EventProp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventProp_propId_fkey" FOREIGN KEY ("propId") REFERENCES "Prop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventCharacterProp" (
    "eventId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "propId" TEXT NOT NULL,
    "notes" TEXT,
    PRIMARY KEY ("eventId", "characterId", "propId"),
    CONSTRAINT "EventCharacterProp_eventId_characterId_fkey" FOREIGN KEY ("eventId", "characterId") REFERENCES "EventCharacter" ("eventId", "characterId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventCharacterProp_propId_fkey" FOREIGN KEY ("propId") REFERENCES "Prop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Makeup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Makeup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventCharacterMakeup" (
    "eventId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "makeupId" TEXT NOT NULL,
    "notes" TEXT,
    PRIMARY KEY ("eventId", "characterId", "makeupId"),
    CONSTRAINT "EventCharacterMakeup_eventId_characterId_fkey" FOREIGN KEY ("eventId", "characterId") REFERENCES "EventCharacter" ("eventId", "characterId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventCharacterMakeup_makeupId_fkey" FOREIGN KEY ("makeupId") REFERENCES "Makeup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wardrobe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wardrobe_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventCharacterWardrobe" (
    "eventId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "wardrobeId" TEXT NOT NULL,
    "notes" TEXT,
    PRIMARY KEY ("eventId", "characterId", "wardrobeId"),
    CONSTRAINT "EventCharacterWardrobe_eventId_characterId_fkey" FOREIGN KEY ("eventId", "characterId") REFERENCES "EventCharacter" ("eventId", "characterId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventCharacterWardrobe_wardrobeId_fkey" FOREIGN KEY ("wardrobeId") REFERENCES "Wardrobe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hairstyle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hairstyle_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventCharacterHairstyle" (
    "eventId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "hairstyleId" TEXT NOT NULL,
    "notes" TEXT,
    PRIMARY KEY ("eventId", "characterId", "hairstyleId"),
    CONSTRAINT "EventCharacterHairstyle_eventId_characterId_fkey" FOREIGN KEY ("eventId", "characterId") REFERENCES "EventCharacter" ("eventId", "characterId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventCharacterHairstyle_hairstyleId_fkey" FOREIGN KEY ("hairstyleId") REFERENCES "Hairstyle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Prop_projectId_name_key" ON "Prop"("projectId", "name");

-- CreateIndex
CREATE INDEX "Prop_projectId_idx" ON "Prop"("projectId");

-- CreateIndex
CREATE INDEX "EventProp_propId_idx" ON "EventProp"("propId");

-- CreateIndex
CREATE INDEX "EventCharacterProp_characterId_idx" ON "EventCharacterProp"("characterId");

-- CreateIndex
CREATE INDEX "EventCharacterProp_propId_idx" ON "EventCharacterProp"("propId");

-- CreateIndex
CREATE UNIQUE INDEX "Makeup_projectId_name_key" ON "Makeup"("projectId", "name");

-- CreateIndex
CREATE INDEX "Makeup_projectId_idx" ON "Makeup"("projectId");

-- CreateIndex
CREATE INDEX "EventCharacterMakeup_makeupId_idx" ON "EventCharacterMakeup"("makeupId");

-- CreateIndex
CREATE INDEX "EventCharacterMakeup_characterId_idx" ON "EventCharacterMakeup"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Wardrobe_projectId_name_key" ON "Wardrobe"("projectId", "name");

-- CreateIndex
CREATE INDEX "Wardrobe_projectId_idx" ON "Wardrobe"("projectId");

-- CreateIndex
CREATE INDEX "EventCharacterWardrobe_wardrobeId_idx" ON "EventCharacterWardrobe"("wardrobeId");

-- CreateIndex
CREATE INDEX "EventCharacterWardrobe_characterId_idx" ON "EventCharacterWardrobe"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Hairstyle_projectId_name_key" ON "Hairstyle"("projectId", "name");

-- CreateIndex
CREATE INDEX "Hairstyle_projectId_idx" ON "Hairstyle"("projectId");

-- CreateIndex
CREATE INDEX "EventCharacterHairstyle_hairstyleId_idx" ON "EventCharacterHairstyle"("hairstyleId");

-- CreateIndex
CREATE INDEX "EventCharacterHairstyle_characterId_idx" ON "EventCharacterHairstyle"("characterId");
