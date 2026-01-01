# Data Model: Chat Ledger

## Core Tables

### `uploads`
Tracks import jobs.

```sql
id          SERIAL PRIMARY KEY
filename    TEXT NOT NULL
status      TEXT NOT NULL (pending | processing | completed | error)
created_at  TIMESTAMP DEFAULT NOW()
```

### `messages`
Parsed WhatsApp messages with reliability assessments.

```sql
id                     SERIAL PRIMARY KEY
upload_id              INTEGER NOT NULL (FK -> uploads)
chat_name              TEXT
sender_name            TEXT
timestamp_original     TEXT (raw input, preserved)
timestamp_normalized   TIMESTAMP (parsed, may be NULL)
content                TEXT
message_type           TEXT (text | media | system | deleted)
is_edited              BOOLEAN DEFAULT FALSE
reliability_status     TEXT (verified | likely | needs_review | unverifiable)
reliability_reason     TEXT (human-readable explanation)
raw_message            TEXT (full original line, unmodified)
```

### `parsing_issues`
All anomalies detected during parsing.

```sql
id               SERIAL PRIMARY KEY
upload_id        INTEGER NOT NULL (FK -> uploads)
message_id       INTEGER (optional FK -> messages)
issue_type       TEXT (orphaned_line | timestamp_parse_error | boundary_unclear | etc.)
severity         TEXT (info | warning | critical)
description      TEXT (what happened)
suggested_action TEXT (what the auditor should do)
raw_message      TEXT (the problematic line)
```

## Invariants

### Immutability
- `raw_message` is NEVER modified. It is the source of truth.
- All transformations are logged in the `parsing_issues` table.

### Reliability Status Logic
```
verified:       timestamp matches known format && sender detected && no ambiguities
likely:         format recognized but minor variation || multi-line with confirmed sender
needs_review:   timestamp unclear || sender uncertain || split boundaries
unverifiable:   cannot determine sender || format unrecognizable || possible metadata
```

### Timestamps
- `timestamp_original`: Exactly as it appeared in the export (preserved as-is).
- `timestamp_normalized`: Parsed to ISO 8601 if successful, otherwise NULL.
- Timezone is NOT adjusted. Auditor must manually verify.

## Export Format (Excel)

### Sheet 1: Messages
Columns (in order):
- ID
- When (timestampOriginal)
- Who (senderName)
- Reliability (status: Verified / Likely Accurate / Needs Review / Unverifiable)
- Why (reliabilityReason)
- What (content)
- Type (messageType)
- Raw Line (rawMessage)

**Formatting**:
- Header row: dark blue background, white text, frozen
- "Needs Review" rows: light yellow background
- "Unverifiable" rows: light red background

### Sheet 2: Issues
Columns:
- Issue ID
- Severity (CRITICAL / WARNING / INFO)
- Type (issue_type)
- What Happened (description)
- What To Do (suggestedAction)
- Raw Line (rawMessage)

**Formatting**:
- Header row: dark blue, frozen
- CRITICAL cells: red text, bold

### Sheet 3: Overview
Summary statistics + limitations.

**Contents**:
1. Export metadata (date, product version)
2. Message reliability breakdown (counts by status)
3. Issues summary (counts by severity)
4. Known limitations (5 items)

## Data Ownership & Export

### Principles
1. **No data persistence**: All data is tied to a specific upload job. Users can delete uploads.
2. **Deterministic export**: Same input → Same output (no randomization, no AI variation).
3. **Explicit action**: Export requires a click. No automatic uploads to cloud.
4. **Logged**: Every export is timestamped in the Overview sheet.

### Export Workflow
1. User clicks "Export Audit File"
2. Backend queries all messages and issues for the upload ID
3. Excel file is generated (in-memory)
4. File is sent to browser (no storage)
5. User downloads

### No Platform Lock-In
- Excel is an industry standard format
- Raw data can be re-parsed by any tool
- No proprietary formats

## Example Data Flow

```
Input (raw export):
12/30/25, 10:00 - Alice: Hello
12/30/25, 10:01 - Bob: Hi there
This is a continuation of Bob's message.

Parsed:
messages[0]: {
  upload_id: 1,
  sender_name: "Alice",
  timestamp_original: "12/30/25, 10:00",
  timestamp_normalized: 2025-12-30T10:00:00Z,
  content: "Hello",
  message_type: "text",
  reliability_status: "verified",
  reliability_reason: "Standard Android format with 24-hour timestamp. No ambiguities detected.",
  raw_message: "12/30/25, 10:00 - Alice: Hello"
}

messages[1]: {
  upload_id: 1,
  sender_name: "Bob",
  timestamp_original: "12/30/25, 10:01",
  timestamp_normalized: 2025-12-30T10:01:00Z,
  content: "Hi there\nThis is a continuation of Bob's message.",
  message_type: "text",
  reliability_status: "likely",
  reliability_reason: "Message spans multiple lines. Sender confirmed by timestamp match.",
  raw_message: "12/30/25, 10:01 - Bob: Hi there\nThis is a continuation of Bob's message."
}

Excel Output:
Row 1: Headers
Row 2: Alice, 12/30/25 10:00, ✓ Verified, "Standard Android format...", "Hello"
Row 3: Bob, 12/30/25 10:01, ◐ Likely Accurate, "Message spans multiple lines...", "Hi there\nThis is a continuation..."
```
