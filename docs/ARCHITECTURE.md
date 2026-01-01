# System Architecture

## Product Name: Chat Ledger
**Rationale**: "Ledger" implies immutability, financial accuracy, and a record of truth. It appeals strongly to the target audience (auditors, legal, finance) who value precision over "tech" features.

## Directory Structure & Responsibilities

### `/server` (Backend)
- **Ingest**: Handles file uploads (multer), text decoding, and initial validation. Ensures data is safe to process.
- **Parser**: The core "Regex + State Machine" engine. Responsible for deterministic message boundary detection.
- **Confidence**: Logic that assigns a score (0-1) AND a human-readable reason for that score.
- **Audit**: Tracks parsing issues (orphaned lines, malformed timestamps) and logs them to the `parsing_issues` table.
- **Export**: Generates the Excel file (`excel.ts`). Ensures the output matches the schema exactly.

### `/client` (Frontend)
- **UI**: React components generated to be calm, minimal, and high-contrast.
- **Data Visualization**: Charts for high-level stats, but text-first tables for the actual audit work.

### `/shared`
- **Schema**: The single source of truth for data models (`schema.ts`).
- **Routes**: API contract (`routes.ts`) ensuring type safety between frontend and backend.

## Data Flow
1. **Upload**: User uploads `.txt` or `.zip`.
2. **Ingest**: Server receives file, validates type.
3. **Parse**: Content is streamed through the Parser.
    - Each line is evaluated.
    - Messages are constructed.
    - Confidence scores and reasons are assigned.
    - Issues are flagged.
4. **Persist**: Validated data is stored in PostgreSQL.
5. **Review**: User reviews data in the "Chat Ledger" Dashboard.
6. **Export**: User clicks "Export Audit File" -> Excel file generated.
