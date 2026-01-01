# Chat Ledger

## Overview

Chat Ledger is a production-grade WhatsApp chat export parsing and analysis tool designed for auditors, legal teams, finance professionals, and compliance officers. It converts messy WhatsApp text exports into structured, trustworthy Excel files with full audit trails.

The core philosophy prioritizes correctness, traceability, and transparency over AI-driven "magic" — all parsing logic is deterministic and testable, with no silent failures or hidden assumptions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Tech Stack
- **Frontend**: React with TypeScript, Vite bundler, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Processing**: Multer for uploads, ExcelJS for Excel generation

### Directory Structure
- `/client` - React frontend application
- `/server` - Express backend with parsing logic
- `/shared` - Shared TypeScript types and schemas (single source of truth)
- `/docs` - Architecture and design documentation

### Core Data Flow
1. User uploads WhatsApp `.txt` export via drag-and-drop zone
2. Server ingests and validates file encoding
3. Deterministic regex parser extracts messages with state machine logic
4. Each message receives a reliability assessment (Verified/Likely/Needs Review/Unverifiable) with human-readable explanations
5. Parsing issues are logged separately with severity levels and suggested actions
6. Data persists to PostgreSQL
7. User reviews parsed data in dashboard
8. Excel export generates auditor-ready spreadsheet

### Key Design Decisions
- **No AI parsing**: Uses regex + state machine for predictable, testable results
- **Raw message preservation**: Original text is never modified, stored as `rawMessage`
- **Human-readable confidence**: No percentages — uses categories like "Verified" with plain English explanations
- **Full audit trail**: All parsing anomalies logged to `parsing_issues` table with suggested remediation

### Database Schema (3 tables)
- `uploads` - Tracks import jobs and processing status
- `messages` - Parsed messages with reliability assessments and original raw text
- `parsing_issues` - Logged anomalies with severity, description, and suggested actions

## External Dependencies

### Database
- PostgreSQL (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe queries
- `connect-pg-simple` for session storage

### Key Libraries
- `exceljs` - Excel file generation for audit exports
- `multer` - File upload handling
- `date-fns` - Date parsing and formatting
- `recharts` - Analytics charts in dashboard
- `@tanstack/react-query` - Client-side data fetching and caching

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - For session security (if authentication added)