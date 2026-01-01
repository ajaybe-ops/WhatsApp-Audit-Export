import { db } from "./db";
import {
  uploads, messages, parsingIssues,
  type Upload, type Message, type ParsingIssue,
  type CreateUploadRequest
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Uploads
  createUpload(filename: string): Promise<Upload>;
  getUpload(id: number): Promise<Upload | undefined>;
  getAllUploads(): Promise<Upload[]>;
  updateUploadStatus(id: number, status: string): Promise<Upload>;

  // Messages
  createMessages(msgs: Omit<Message, "id">[]): Promise<void>;
  getMessages(uploadId: number, limit?: number, offset?: number): Promise<{ items: Message[], total: number }>;
  
  // Issues
  createIssues(issues: Omit<ParsingIssue, "id">[]): Promise<void>;
  getIssues(uploadId: number): Promise<ParsingIssue[]>;

  // Stats
  getUploadStats(uploadId: number): Promise<{ messageCount: number, issueCount: number }>;
}

export class DatabaseStorage implements IStorage {
  async createUpload(filename: string): Promise<Upload> {
    const [upload] = await db.insert(uploads)
      .values({ filename, status: 'processing' })
      .returning();
    return upload;
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload;
  }

  async getAllUploads(): Promise<Upload[]> {
    return await db.select().from(uploads).orderBy(desc(uploads.createdAt));
  }

  async updateUploadStatus(id: number, status: string): Promise<Upload> {
    const [upload] = await db.update(uploads)
      .set({ status })
      .where(eq(uploads.id, id))
      .returning();
    return upload;
  }

  async createMessages(msgs: Omit<Message, "id">[]): Promise<void> {
    if (msgs.length === 0) return;
    // Batch insert
    await db.insert(messages).values(msgs);
  }

  async getMessages(uploadId: number, limit: number = 50, offset: number = 0): Promise<{ items: Message[], total: number }> {
    const items = await db.select()
      .from(messages)
      .where(eq(messages.uploadId, uploadId))
      .limit(limit)
      .offset(offset)
      .orderBy(messages.id);
    
    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.uploadId, uploadId));
      
    return { items, total: Number(countResult?.count || 0) };
  }

  async createIssues(issues: Omit<ParsingIssue, "id">[]): Promise<void> {
    if (issues.length === 0) return;
    await db.insert(parsingIssues).values(issues);
  }

  async getIssues(uploadId: number): Promise<ParsingIssue[]> {
    return await db.select()
      .from(parsingIssues)
      .where(eq(parsingIssues.uploadId, uploadId));
  }

  async getUploadStats(uploadId: number): Promise<{ messageCount: number, issueCount: number }> {
    const [msgCount] = await db.select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.uploadId, uploadId));
      
    const [issCount] = await db.select({ count: sql<number>`count(*)` })
      .from(parsingIssues)
      .where(eq(parsingIssues.uploadId, uploadId));

    return { 
      messageCount: Number(msgCount?.count || 0), 
      issueCount: Number(issCount?.count || 0) 
    };
  }
}

export const storage = new DatabaseStorage();
