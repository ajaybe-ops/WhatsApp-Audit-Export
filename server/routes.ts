import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import multer from "multer";
import { parseWhatsAppChat } from "./parser";
import { generateExcel } from "./excel";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.uploads.list.path, async (req, res) => {
    const uploads = await storage.getAllUploads();
    res.json(uploads);
  });

  app.get(api.uploads.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const upload = await storage.getUpload(id);
    if (!upload) return res.status(404).json({ message: "Upload not found" });
    
    const stats = await storage.getUploadStats(id);
    res.json({ ...upload, ...stats });
  });

  app.post(api.uploads.create.path, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    
    try {
      // 1. Create Upload Record
      const uploadRecord = await storage.createUpload(req.file.originalname);
      
      // 2. Parse Content (Async but awaiting here for simplicity in MVP)
      const content = req.file.buffer.toString("utf-8");
      const { messages, issues } = parseWhatsAppChat(content, uploadRecord.id);
      
      // 3. Save Data
      await storage.createMessages(messages);
      await storage.createIssues(issues);
      
      // 4. Update Status
      await storage.updateUploadStatus(uploadRecord.id, "completed");
      
      res.status(201).json(uploadRecord);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Processing failed" });
    }
  });

  app.get(api.uploads.getMessages.path, async (req, res) => {
    const id = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 50;
    
    const result = await storage.getMessages(id, pageSize, (page - 1) * pageSize);
    res.json({ ...result, page, pageSize });
  });

  app.get(api.uploads.getIssues.path, async (req, res) => {
    const id = Number(req.params.id);
    const issues = await storage.getIssues(id);
    res.json(issues);
  });

  app.get(api.uploads.export.path, async (req, res) => {
    const id = Number(req.params.id);
    const upload = await storage.getUpload(id);
    if (!upload) return res.status(404).json({ message: "Upload not found" });
    
    const messages = await storage.getMessages(id, 100000, 0); // Get all
    const issues = await storage.getIssues(id);
    
    const buffer = await generateExcel(messages.items, issues);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ChatLedger-Audit-${upload.filename}.xlsx"`);
    res.send(buffer);
  });

  return httpServer;
}
