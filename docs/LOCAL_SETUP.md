# Local Development Setup

Follow these steps to run Chat Ledger on your local machine.

## Prerequisites
- **Node.js**: Version 18 or higher.
- **PostgreSQL**: A local instance or a cloud database (like Neon or Supabase).
- **Git**: For version control.

## 1. Get the Code
Download the project ZIP from Replit or clone it from GitHub.

## 2. Install Dependencies
```bash
npm install
```

## 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=a_long_random_string_for_security
```

*Note: You can find your original Replit `DATABASE_URL` in the "Secrets" tab, but it is recommended to use a local database for development.*

## 4. Setup the Database
Sync your local database with the project schema:
```bash
npm run db:push
```

## 5. Start the Application
```bash
npm run dev
```
The app will be available at `http://localhost:5000`.

## Troubleshooting
- **Port Conflicts**: If port 5000 is in use, you can change it in `server/index.ts`.
- **Database Connection**: Ensure your `DATABASE_URL` is correct and your IP is allowed to connect to the database.
