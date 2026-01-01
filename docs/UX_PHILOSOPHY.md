# UX Philosophy: Chat Ledger

## Core Principle
**Non-technical users must understand and trust the output without asking for help.**

## Design Rules

### 1. No Percentages
❌ "Confidence: 72%"
✅ "Verified" / "Likely Accurate" / "Needs Review" / "Unverifiable"

### 2. No AI Language
❌ "The AI determined..."
❌ "Machine learning confidence score..."
✅ "Timestamp format matches Android standard."
✅ "Message spans multiple lines, manual review recommended."

### 3. One Question Per Screen
- Upload page: "Where's your WhatsApp export?"
- Dashboard: "What's in your chat?"
- Issues tab: "What might be wrong?"
- Export: "Download your audit file."

### 4. Large, Clear Text
- Header: 18px+
- Body: 14px+
- Labels: 12px+
- Sufficient line height

### 5. Print-Friendly
- Dark text on light background (or adjustable)
- No reliance on color alone for meaning
- Excel export is primary output (not screen)

### 6. Legal/Finance Safe
- Neutral palette (grays, dark blues, whites)
- No casual or playful language
- Clear liability disclaimers
- Known limitations listed everywhere

## Reliability Categories

### ✓ Verified
**What it means**: Timestamp format is standard, sender consistent, structure clear.
**Suggested action**: Include in final audit without additional review.
**Examples**:
- iOS message: `[12/30/25, 10:00 AM] Alice: Hello`
- Android message: `12/30/25, 10:00 - Alice: Hello`

### ◐ Likely Accurate
**What it means**: Format recognized but has minor variations. Structure appears intact.
**Suggested action**: Include in audit with a note that format varies slightly.
**Examples**:
- Timestamp with slight format variation (e.g., DD/MM/YY vs DD-MM-YY)
- Multi-line message with confirmed sender

### ⚠ Needs Review
**What it means**: Timestamp format unclear, sender uncertain, or message split across lines.
**Suggested action**: Manually verify the raw line. Compare to surrounding messages.
**Examples**:
- Ambiguous timestamp format
- Unclear message boundaries
- Possible OCR errors

### ✗ Unverifiable
**What it means**: Cannot determine original sender or timestamp with confidence.
**Suggested action**: Exclude from formal audit or flag for legal review.
**Examples**:
- No timestamp detected
- Message appears to be a file header or metadata
- Severe format corruption

## Error Messages

### Always include:
1. **What happened** (plain English)
2. **Why it might matter** (auditor perspective)
3. **What to do next** (action for the user)

### Example
❌ "Parse error at line 47"
✅ "Line 47 doesn't match known WhatsApp formats. It might be a header, emoji issue, or corrupted character. Check the raw input below and decide if it should be included."

## Known Limitations (Displayed Prominently)

1. Chat metadata (group name, participant list) is inferred from context, not parsed.
2. Timestamps are preserved as-is. Timezone normalization requires manual verification.
3. Deleted messages are flagged but content cannot be recovered.
4. Media placeholders (`<Media omitted>`) are detected but not recoverable.
5. This export is a parsing aid, not a legal record. Auditors should cross-check with original device.

## Data Processing Flow (Transparent to User)

1. **Upload**: File uploaded → Validated for size/type
2. **Ingest**: File decoded (UTF-8, detect if Latin-1)
3. **Parse**: Line-by-line → Message boundaries detected
4. **Assess**: Each message → Reliability score + reason
5. **Flag**: Anomalies → Issues logged
6. **Export**: All data → Excel file with full audit trail
7. **Download**: User → Gets deterministic, reproducible export

## Copy Guidelines

- **Headings**: Action-oriented, benefit-focused
  - ✓ "Upload Your Chat"
  - ✓ "Review Issues"
  - ✗ "Message Processing System"

- **Buttons**: Clear verb
  - ✓ "Export Audit File"
  - ✓ "Download Excel"
  - ✗ "Process"

- **Help text**: Assume no technical knowledge
  - ✓ "Select your WhatsApp backup file from your phone."
  - ✓ "We'll check each message for problems and note them here."
  - ✗ "Regex parser will tokenize input based on message delimiters."

- **Warnings**: Specific, not scary
  - ✓ "This message wasn't recognized. It might be a metadata line or from a different app."
  - ✗ "CRITICAL: UNVERIFIABLE MESSAGE STRUCTURE"

## Accessibility

- High contrast: 4.5:1 minimum
- Keyboard navigation: All interactive elements accessible
- Screen reader: Alt text on icons, descriptive labels
- Mobile: Touch targets 44x44px minimum
