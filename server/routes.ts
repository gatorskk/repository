import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGameSaveSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return the password in the response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Game save routes
  app.get("/api/saves", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const saves = await storage.getSaves(userId);
      return res.status(200).json(saves);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/saves/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid save ID" });
      }
      
      const save = await storage.getSaveById(id);
      if (!save) {
        return res.status(404).json({ message: "Save not found" });
      }
      
      return res.status(200).json(save);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/saves", async (req: Request, res: Response) => {
    try {
      const saveData = insertGameSaveSchema.parse(req.body);
      const user = await storage.getUser(saveData.user_id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const save = await storage.createSave(saveData);
      return res.status(201).json(save);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/saves/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid save ID" });
      }
      
      // Partial validation of save data
      const saveData = req.body;
      const updatedSave = await storage.updateSave(id, saveData);
      
      if (!updatedSave) {
        return res.status(404).json({ message: "Save not found" });
      }
      
      return res.status(200).json(updatedSave);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/saves/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid save ID" });
      }
      
      const deleted = await storage.deleteSave(id);
      if (!deleted) {
        return res.status(404).json({ message: "Save not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
