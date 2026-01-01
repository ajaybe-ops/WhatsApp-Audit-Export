import { Message, ParsingIssue } from "@shared/schema";
import exceljs from "exceljs";

export async function generateExcel(messages: Message[], issues: ParsingIssue[]): Promise<Buffer> {
  const workbook = new exceljs.Workbook();
  
  // 1. Messages Sheet
  const msgSheet = workbook.addWorksheet("Messages");
  msgSheet.columns = [
    { header: "ID", key: "id", width: 8 },
    { header: "When", key: "timestampOriginal", width: 18 },
    { header: "Who", key: "senderName", width: 18 },
    { header: "Reliability & Why", key: "confidenceReason", width: 45 },
    { header: "What", key: "content", width: 50 },
    { header: "Type", key: "messageType", width: 10 },
    { header: "Raw Line", key: "rawMessage", width: 50 },
  ];
  
  msgSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  msgSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2C3E50' }
  };
  
  messages.forEach(msg => {
    const row = msgSheet.addRow({
      id: msg.id,
      timestampOriginal: msg.timestampOriginal || "(unknown)",
      senderName: msg.senderName || "(unknown)",
      confidenceReason: msg.confidenceReason || "No assessment",
      content: msg.content,
      messageType: msg.messageType,
      rawMessage: msg.rawMessage
    });

    if ((msg.confidenceReason || "").includes("Needs Review")) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    } else if ((msg.confidenceReason || "").includes("Unverifiable")) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
    }
  });

  msgSheet.views = [{ state: 'frozen', ySplit: 1 }];

  // 2. Issues Sheet
  const issueSheet = workbook.addWorksheet("Issues");
  issueSheet.columns = [
    { header: "Issue ID", key: "id", width: 8 },
    { header: "Severity", key: "severity", width: 10 },
    { header: "Type", key: "issueType", width: 18 },
    { header: "What Happened", key: "description", width: 50 },
    { header: "What To Do", key: "suggestedAction", width: 40 },
    { header: "Raw Line", key: "rawMessage", width: 50 },
  ];
  
  issueSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  issueSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
  
  issues.forEach(issue => {
    const row = issueSheet.addRow({
      id: issue.id,
      severity: issue.severity.toUpperCase(),
      issueType: issue.issueType,
      description: issue.description,
      suggestedAction: issue.suggestedAction || "Review this entry manually.",
      rawMessage: issue.rawMessage
    });
    
    if (issue.severity === 'critical') {
      row.getCell('severity').font = { color: { argb: 'FFFF0000' }, bold: true };
    } else if (issue.severity === 'warning') {
      row.getCell('severity').font = { color: { argb: 'FFFF9800' } };
    }
  });

  issueSheet.views = [{ state: 'frozen', ySplit: 1 }];

  // 3. Overview Sheet
  const statsSheet = workbook.addWorksheet("Overview");
  statsSheet.columns = [
    { header: "Category", key: "category", width: 30 },
    { header: "Value", key: "value", width: 15 },
  ];
  
  statsSheet.getRow(1).font = { bold: true };
  
  statsSheet.addRow({ category: "EXPORT SUMMARY", value: "" });
  statsSheet.addRow({ category: "Product", value: "Chat Ledger" });
  statsSheet.addRow({ category: "Export Date", value: new Date().toISOString() });
  statsSheet.addRow({ category: "", value: "" });
  
  statsSheet.addRow({ category: "MESSAGE STATISTICS", value: "" });
  statsSheet.addRow({ category: "Total Messages", value: messages.length });
  statsSheet.addRow({ category: "Total Issues", value: issues.length });
  statsSheet.addRow({ category: "", value: "" });
  
  statsSheet.addRow({ category: "KNOWN LIMITATIONS", value: "" });
  const limitations = [
    "Chat metadata requires manual verification",
    "Timestamps preserved as-is, no timezone normalization",
    "Deleted messages flagged but content not recoverable",
    "Media files not extracted (only placeholders)",
    "Treat this as a parsing aid, not a definitive record",
  ];
  limitations.forEach((limitation, idx) => {
    statsSheet.addRow({ category: `${idx + 1}. ${limitation}`, value: "" });
  });

  return await workbook.xlsx.writeBuffer() as Buffer;
}
