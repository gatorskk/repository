import { 
  users, 
  gameSaves, 
  type User, 
  type InsertUser, 
  type GameSave, 
  type InsertGameSave 
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

// Storage interface for game data
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game save methods
  getSaves(userId: number): Promise<GameSave[]>;
  getSaveById(id: number): Promise<GameSave | undefined>;
  createSave(save: InsertGameSave): Promise<GameSave>;
  updateSave(id: number, save: Partial<InsertGameSave>): Promise<GameSave | undefined>;
  deleteSave(id: number): Promise<boolean>;
}

// Memory storage implementation for development
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private savesMap: Map<number, GameSave>;
  private userIdCounter: number;
  private saveIdCounter: number;

  constructor() {
    this.usersMap = new Map();
    this.savesMap = new Map();
    this.userIdCounter = 1;
    this.saveIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      created_at: now
    };
    this.usersMap.set(id, user);
    return user;
  }

  // Game save methods
  async getSaves(userId: number): Promise<GameSave[]> {
    return Array.from(this.savesMap.values()).filter(
      (save) => save.user_id === userId
    );
  }

  async getSaveById(id: number): Promise<GameSave | undefined> {
    return this.savesMap.get(id);
  }

  async createSave(insertSave: InsertGameSave): Promise<GameSave> {
    const id = this.saveIdCounter++;
    const now = new Date();
    const save: GameSave = {
      ...insertSave,
      id,
      created_at: now,
      updated_at: now
    };
    this.savesMap.set(id, save);
    return save;
  }

  async updateSave(id: number, saveData: Partial<InsertGameSave>): Promise<GameSave | undefined> {
    const existingSave = this.savesMap.get(id);
    if (!existingSave) return undefined;

    const updatedSave: GameSave = {
      ...existingSave,
      ...saveData,
      updated_at: new Date()
    };
    this.savesMap.set(id, updatedSave);
    return updatedSave;
  }

  async deleteSave(id: number): Promise<boolean> {
    return this.savesMap.delete(id);
  }
}

// Create an instance of the storage
export const storage = new MemStorage();
