import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Game save data table
export const gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  character_data: json("character_data").notNull(),
  inventory_data: json("inventory_data").notNull(),
  quest_data: json("quest_data").notNull(),
  world_state: json("world_state").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Schema validation with Zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameSaveSchema = createInsertSchema(gameSaves).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;

// Game character type
export type Character = {
  name: string;
  level: number;
  experience: number;
  stats: {
    strength: number;
    intelligence: number;
    dexterity: number;
    constitution: number;
    charisma: number;
  };
  health: {
    current: number;
    max: number;
  };
  mana: {
    current: number;
    max: number;
  };
  skills: {
    id: string;
    name: string;
    description: string;
    level: number;
    damage?: number;
    healing?: number;
    manaCost: number;
  }[];
  gold: number;
};

// Inventory item type
export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'quest' | 'misc';
  value: number;
  stats?: {
    [key: string]: number;
  };
  quantity: number;
  equipped?: boolean;
};

// Quest type
export type Quest = {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  objectives: {
    id: string;
    description: string;
    current: number;
    target: number;
    completed: boolean;
  }[];
  rewards: {
    experience: number;
    gold: number;
    items?: string[];
  };
};

// NPC type
export type NPC = {
  id: string;
  name: string;
  type: 'friendly' | 'neutral' | 'hostile';
  dialogues: {
    id: string;
    text: string;
    options?: {
      text: string;
      nextId?: string;
      action?: string;
    }[];
  }[];
};

// Enemy type
export type Enemy = {
  id: string;
  name: string;
  level: number;
  health: {
    current: number;
    max: number;
  };
  stats: {
    strength: number;
    intelligence: number;
    dexterity: number;
  };
  attacks: {
    name: string;
    damage: [number, number]; // Min and max damage
    description: string;
  }[];
  experience: number;
  gold: [number, number]; // Min and max gold drop
  loot?: {
    itemId: string;
    chance: number; // 0-1 probability
  }[];
};

// Map location type
export type MapLocation = {
  id: string;
  name: string;
  description: string;
  npcs: string[]; // NPC IDs
  enemies: string[]; // Enemy IDs
  quests: string[]; // Quest IDs
  connectedLocations: string[]; // Location IDs
  background: string; // Background texture
  discovered: boolean;
};
