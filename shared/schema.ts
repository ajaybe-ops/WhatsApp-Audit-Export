import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === RELIABILITY CATEGORIES ===
export const reliabilityStatuses = [
  "verified",
  "likely",
  "needs_review",
  "unverifiable",
] as const;

export type ReliabilityStatus = typeof reliabilityStatuses[number];

// === TABLE DEFINITIONS ===

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").notNull(),
  chatName: text("chat_name"),
  senderName: text("sender_name"),
  timestampOriginal: text("timestamp_original"),
  timestampNormalized: timestamp("timestamp_normalized"),
  content: text("content"),
  messageType: text("message_type").notNull().default("text"),
  isEdited: boolean("is_edited").default(false),
  confidenceScore: real("confidence_score").default(1.0),
  confidenceReason: text("confidence_reason"), // Now stores reliability status + reason
  rawMessage: text("raw_message").notNull(),
});

export const parsingIssues = pgTable("parsing_issues", {
  id: serial("id").primaryKey(),
  uploadId: integer("upload_id").notNull(),
  messageId: integer("message_id"),
  issueType: text("issue_type").notNull(),
  severity: text("severity").notNull(),
  description: text("description").notNull(),
  suggestedAction: text("suggested_action"),
  rawMessage: text("raw_message"),
});

// === SCHEMAS ===

export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export const insertParsingIssueSchema = createInsertSchema(parsingIssues).omit({ id: true });

// === EXPLICIT API TYPES ===

export type Upload = typeof uploads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ParsingIssue = typeof parsingIssues.$inferSelect;

export type CreateUploadRequest = z.infer<typeof insertUploadSchema>;

export interface UploadResponse extends Upload {
  messageCount?: number;
  issueCount?: number;
}
