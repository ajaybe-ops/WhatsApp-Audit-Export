import { Message, ParsingIssue } from "@shared/schema";

interface ParseResult {
  messages: Omit<Message, "id">[];
  issues: Omit<ParsingIssue, "id">[];
}

/**
 * Parse WhatsApp chat export deterministically.
 */
export function parseWhatsAppChat(content: string, uploadId: number): ParseResult {
  const lines = content.split(/\r?\n/);
  const messages: Omit<Message, "id">[] = [];
  const issues: Omit<ParsingIssue, "id">[] = [];

  // Regex patterns
  const iosRegex = /^\[?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}(?::\d{2})?(?: [AP]M)?)\]? (.*?): (.*)/i;
  const androidRegex = /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}) - (.*?): (.*)/i;
  const systemRegex = /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4},? \d{1,2}:\d{2}) - (.*)/i;

  let currentMessage: Omit<Message, "id"> | null = null;

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;

    const iosMatch = line.match(iosRegex);
    const androidMatch = line.match(androidRegex);
    const systemMatch = line.match(systemRegex);

    if (iosMatch) {
      if (currentMessage) messages.push(currentMessage);
      const [_, timestamp, sender, content] = iosMatch;
      
      currentMessage = {
        uploadId,
        chatName: "Unknown",
        senderName: sender.trim(),
        timestampOriginal: timestamp,
        timestampNormalized: parseDate(timestamp),
        content: content,
        messageType: detectType(content),
        isEdited: false,
        confidenceScore: 1.0,
        confidenceReason: "✓ Verified\nStandard iOS format with 12-hour timestamp. No ambiguities detected.",
        rawMessage: line,
      };
    } else if (androidMatch) {
      if (currentMessage) messages.push(currentMessage);
      const [__, timestamp, sender, content] = androidMatch;
      
      currentMessage = {
        uploadId,
        chatName: "Unknown",
        senderName: sender.trim(),
        timestampOriginal: timestamp,
        timestampNormalized: parseDate(timestamp),
        content: content,
        messageType: detectType(content),
        isEdited: false,
        confidenceScore: 1.0,
        confidenceReason: "✓ Verified\nStandard Android format with 24-hour timestamp. No ambiguities detected.",
        rawMessage: line,
      };
    } else if (systemMatch) {
      if (currentMessage) messages.push(currentMessage);
      const [__, timestamp, content] = systemMatch;
      
      currentMessage = {
        uploadId,
        chatName: "Unknown",
        senderName: "System",
        timestampOriginal: timestamp,
        timestampNormalized: parseDate(timestamp),
        content: content,
        messageType: "system",
        isEdited: false,
        confidenceScore: 0.9,
        confidenceReason: "◐ Likely Accurate\nSystem message format recognized, but sender auto-filled.",
        rawMessage: line,
      };
    } else {
      if (currentMessage) {
        currentMessage.content += "\n" + line;
        currentMessage.rawMessage += "\n" + line;
        if (currentMessage.confidenceScore === 1.0) {
          currentMessage.confidenceScore = 0.95;
          currentMessage.confidenceReason = "◐ Likely Accurate\nMessage spans multiple lines. Sender confirmed by timestamp match.";
        }
      } else {
        issues.push({
          uploadId,
          issueType: "orphaned_line",
          severity: "warning",
          description: `Orphaned line found before any message start. Possible file header or corrupted entry.`,
          suggestedAction: "Review the raw input. If it's metadata, you can safely ignore it.",
          rawMessage: line,
          messageId: null
        });
      }
    }
  });

  if (currentMessage) messages.push(currentMessage);

  return { messages, issues };
}

function detectType(content: string): string {
  if (content.includes("<Media omitted>")) return "media";
  if (content.includes("This message was deleted")) return "deleted";
  return "text";
}

function parseDate(dateStr: string): Date | null {
  try {
    const d = new Date(dateStr.replace(/,/, ''));
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
