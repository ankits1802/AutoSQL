
// src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_FILE_NAME = 'database.sqlite';
// Adjust path to be in the project root, outside of .next directory
const dbPath = path.join(process.cwd(), DB_FILE_NAME);

// Ensure the directory exists (though for root, it always does)
// For a nested path like 'data/database.sqlite', you'd ensure 'data' exists:
// const dir = path.dirname(dbPath);
// if (!fs.existsSync(dir)) {
//   fs.mkdirSync(dir, { recursive: true });
// }

let dbInstance: Database.Database;

try {
  dbInstance = new Database(dbPath); // verbose: console.log may be useful for debugging
  console.log(`SQLite database initialized at ${dbPath}`);
  
  // Enable WAL mode for better concurrency and performance
  dbInstance.pragma('journal_mode = WAL');

  // Ensure a basic schema for saved_queries if it doesn't exist
  // This is a good place for minimal bootstrap if seed isn't run
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS saved_queries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sql TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

} catch (error) {
  console.error("Failed to initialize SQLite database:", error);
  // Fallback or throw error, depending on how critical the DB is at startup
  // For this app, we'll let it throw if connection fails.
  throw error;
}

export const db = dbInstance;
