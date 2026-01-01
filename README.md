# AI WhatsApp to Excel Auditor

Audit-ready WhatsApp chat export parsing and analysis tool. Converts messy chat logs into structured, trustworthy Excel files with full audit trails.

## Features
- **Deterministic Parsing**: Uses regex + state machine for predictable, testable results.
- **Reliability Assessments**: Categorizes messages as Verified, Likely Accurate, Needs Review, or Unverifiable with human-readable explanations.
- **Full Audit Trail**: Preserves raw messages and logs all parsing anomalies.
- **Excel Export**: Generates auditor-ready spreadsheets with summary statistics and limitations.

## Tech Stack
- **Frontend**: React, TailwindCSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Export**: ExcelJS

## Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file based on `.env.example`.
4. Push the database schema:
   ```bash
   npm run db:push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
1. Upload a WhatsApp `.txt` export.
2. Review parsed messages and flagged issues.
3. Export the audit-ready Excel file.

## Limitations
See [docs/LIMITATIONS.md](docs/LIMITATIONS.md) for a detailed list of known limitations and auditor guidance.
