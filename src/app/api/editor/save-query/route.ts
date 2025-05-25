
// src/app/api/editor/save-query/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Use SQLite db
import { randomUUID } from 'crypto'; // For generating IDs

interface SaveQueryRequestBody {
  queryId?: string | null; // SQLite document ID (optional for new queries)
  name: string;
  sql: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SaveQueryRequestBody;
    let { queryId, name, sql } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'Query name is required.' }, { status: 400 });
    }
    if (typeof sql !== 'string') {
      return NextResponse.json({ message: 'SQL content must be a string.' }, { status: 400 });
    }

    name = name.trim();
    let newId = queryId || randomUUID();
    let operationType: 'created' | 'updated' = 'updated';

    if (queryId) {
      // Check if queryId exists to decide between UPDATE or INSERT (if ID was, e.g., manually entered and new)
      const checkStmt = db.prepare('SELECT id FROM saved_queries WHERE id = ?');
      const existingQuery = checkStmt.get(queryId);

      if (existingQuery) {
        // Update existing query
        const updateStmt = db.prepare(
          'UPDATE saved_queries SET name = ?, sql = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?'
        );
        updateStmt.run(name, sql, queryId);
      } else {
        // ID provided but not found, so treat as new insert with this preferred ID (if it's a valid UUID format)
        // Or, generate a new one if queryId is not a valid format or we want to ensure uniqueness.
        // For simplicity, we'll try to use the provided ID if it's new.
        const insertStmt = db.prepare(
          'INSERT INTO saved_queries (id, name, sql, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        );
        insertStmt.run(newId, name, sql); // newId is queryId here
        operationType = 'created';
      }
    } else {
      // Create new query
      const insertStmt = db.prepare(
        'INSERT INTO saved_queries (id, name, sql, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      );
      insertStmt.run(newId, name, sql);
      operationType = 'created';
    }

    return NextResponse.json({ 
        message: `Query ${operationType === 'created' ? 'created' : 'updated'} successfully in SQLite`, 
        firestoreId: newId // Keep prop name for frontend compatibility, but it's SQLite ID
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error saving query to SQLite:", error);
    return NextResponse.json({ message: "Error saving query to SQLite", error: error.message }, { status: 500 });
  }
}
