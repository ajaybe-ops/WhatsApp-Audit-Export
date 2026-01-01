# Known Limitations: Chat Ledger

Chat Ledger is a parsing and auditing tool. It is **not** a replacement for original device forensics or legal discovery processes.

## Parsing Limitations

### 1. Chat Metadata
- **Issue**: Group name, participant list, and chat settings are not parsed.
- **Why**: WhatsApp exports vary by device and app version. Reliable extraction requires manual inspection or device access.
- **Workaround**: Auditor must verify chat identity through separate channels (e.g., device screenshots, participant confirmation).

### 2. Timestamp Accuracy
- **Issue**: Timestamps are preserved as-is. No automatic timezone normalization or DST handling.
- **Why**: We cannot reliably infer the device's timezone from the export. Normalizing could introduce errors.
- **Workaround**: Auditor must manually verify timezone and adjust if necessary. Document assumptions in final report.

### 3. Deleted Messages
- **Issue**: Deleted messages are flagged but content is not recoverable.
- **Why**: WhatsApp does not preserve deleted message text in exports.
- **Workaround**: Content exists only on the original device. If critical to audit, request device forensics.

### 4. Media Files
- **Issue**: Media placeholders (`<Media omitted>`) are detected but files are not extracted.
- **Why**: Media is stored separately on devices. Exports contain only markers.
- **Workaround**: If media is relevant to audit, request files via device forensics or direct export.

### 5. Message Boundary Detection
- **Issue**: Messages spanning multiple lines may be incorrectly split or merged if format is non-standard.
- **Why**: We rely on timestamp markers to identify message boundaries. Missing or malformed timestamps cause ambiguity.
- **Workaround**: Messages flagged as "Needs Review" should be manually verified against the original export.

### 6. Encoding Issues
- **Issue**: Emoji, special characters, and non-Latin text may be corrupted if the file encoding is incorrect.
- **Why**: We assume UTF-8 encoding. Some exports use Latin-1, ASCII, or other encodings.
- **Workaround**: Re-export from the device using UTF-8 encoding, or verify special characters manually.

### 7. Device & App Version Variations
- **Issue**: Different versions of WhatsApp (iOS vs Android vs Business) have different export formats.
- **Why**: WhatsApp does not maintain a stable export format across versions and platforms.
- **Workaround**: Messages flagged as "Likely Accurate" or "Needs Review" may reflect format variations, not errors. Auditor should adjust expectations.

### 8. Multi-Language Chats
- **Issue**: Character set issues may occur in mixed-language conversations.
- **Why**: See "Encoding Issues" above.
- **Workaround**: Verify in original export if corruption is suspected.

## Tool Limitations

### 1. No Real-Time Verification
- Chat Ledger cannot verify that the export is authentic (unmodified, unforged).
- **Recommended**: Use device forensics tools (e.g., iLEAD, UFED) for legal-grade verification.

### 2. No Participant Verification
- We cannot verify that the alleged sender actually wrote the message.
- **Recommended**: Cross-check with device access, IP logs, or cryptographic signing (if available).

### 3. No Timestamp Forensics
- Timestamps in the export may be incorrect if the device clock was inaccurate.
- **Recommended**: Cross-check critical timestamps with server logs, call records, or other evidence.

### 4. No Data Minimization
- All data is included in the Excel export. Chat Ledger does not redact personally identifiable information (PII).
- **Recommended**: Auditor must manually remove or redact sensitive information before sharing the audit file.

## Compatibility

### Supported Formats
- ✓ Android WhatsApp text export (.txt)
- ✓ iOS WhatsApp text export (.txt)
- ✓ WhatsApp Business (Android & iOS)
- ⚠ Zipped exports (.zip) — requires extraction first

### Unsupported Formats
- ✗ Binary WhatsApp exports (crypt formats)
- ✗ CSV exports from web.whatsapp.com
- ✗ Third-party backup services (Google Drive, iCloud) — export from device instead

## Security & Privacy

### What Happens to Your Data
1. Your file is uploaded to the server.
2. The file is parsed in-memory (not stored to disk).
3. Parsed messages are stored in a PostgreSQL database tied to your upload ID.
4. You can delete your upload at any time (purges all associated data).
5. The server does **not** use your data for training, analytics, or third-party sharing.

### Recommended Practices
- Do not upload chats containing highly sensitive information to untrusted servers.
- Download the Excel export immediately and delete the server-side copy.
- If handling legal discovery, ensure Chat Ledger usage complies with your jurisdiction's e-discovery rules.

## Legal Disclaimer

**Chat Ledger is a parsing utility, not a legal tool.**

- Do not rely solely on Chat Ledger output for legal proceedings.
- Pair this tool with device forensics, digital forensics experts, and legal counsel.
- Limitations listed above may affect the admissibility of the output as evidence.
- Document all parsing decisions and assumptions in your audit report.

## Roadmap for Future Improvements

- [ ] Automatic timezone detection and normalization
- [ ] Participant tracking and relationship graphs
- [ ] Media metadata extraction (EXIF, hash verification)
- [ ] Batch processing for multiple exports
- [ ] Regex customization for non-WhatsApp chat logs
- [ ] Digital signature verification (if available)
- [ ] Export format: PDF, HTML, JSON alongside Excel
