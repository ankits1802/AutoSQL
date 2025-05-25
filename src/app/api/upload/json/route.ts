
// src/app/api/upload/json/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';

// Helper to sanitize table and column names
const sanitizeName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+|_+$/g, '');
};

// Helper to infer SQLite data type from a JavaScript value
const inferSqliteTypeFromJson = (value: any): string => {
  if (value === null || value === undefined) return 'TEXT'; // Default for null/undefined
  const type = typeof value;
  if (type === 'number') {
    return Number.isInteger(value) ? 'INTEGER' : 'REAL';
  }
  if (type === 'boolean') {
    return 'INTEGER'; // SQLite stores booleans as 0 or 1
  }
  // Could add more checks, e.g. for date strings to convert to DATETIME
  return 'TEXT'; // Default for strings, objects, arrays (which would be stringified)
};


export async function POST(request: NextRequest) {
  try {
    const { fileName, jsonContent } = await request.json();

    if (typeof fileName !== 'string' || fileName.trim() === '') {
      return NextResponse.json({ message: 'File name is required.' }, { status: 400 });
    }
    if (typeof jsonContent !== 'string' || jsonContent.trim() === '') {
      return NextResponse.json({ message: 'JSON content is required.' }, { status: 400 });
    }

    let jsonData: any[];
    try {
      jsonData = JSON.parse(jsonContent);
    } catch (e: any) {
      return NextResponse.json({ message: `Invalid JSON format: ${e.message}` }, { status: 400 });
    }

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return NextResponse.json({ message: 'JSON must be a non-empty array of objects.' }, { status: 400 });
    }

    const firstObject = jsonData[0];
    if (typeof firstObject !== 'object' || firstObject === null || Array.isArray(firstObject)) {
        return NextResponse.json({ message: 'JSON array elements must be objects.' }, { status: 400 });
    }

    const baseTableName = sanitizeName(fileName.split('.').slice(0, -1).join('_') || 'json_import');
    let tableName = baseTableName;
    let tableSuffix = 1;

    // Ensure unique table name
    const checkTableExistsStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?");
    while (checkTableExistsStmt.get(tableName)) {
      tableName = `${baseTableName}_${tableSuffix}`;
      tableSuffix++;
    }

    const headers = Object.keys(firstObject);
    if (headers.length === 0) {
      return NextResponse.json({ message: 'JSON objects must have at least one key.' }, { status: 400 });
    }
    const sanitizedHeaders = headers.map(h => sanitizeName(h));

    // Infer column types from the first object
    const columnTypes: Record<string, string> = {};
    sanitizedHeaders.forEach((header, index) => {
      const originalHeader = headers[index];
      columnTypes[header] = inferSqliteTypeFromJson(firstObject[originalHeader]);
    });

    const columnDefinitions = sanitizedHeaders.map(header => `"${header}" ${columnTypes[header]}`).join(', ');
    const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefinitions});`;

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(createTableSql).run();

      const placeholders = sanitizedHeaders.map(() => '?').join(', ');
      const insertSql = `INSERT INTO "${tableName}" (${sanitizedHeaders.map(h => `"${h}"`).join(', ')}) VALUES (${placeholders});`;
      const insertStmt = db.prepare(insertSql);

      for (const record of jsonData) {
        if (typeof record !== 'object' || record === null) continue; // Skip non-objects
        
        const valuesToInsert = headers.map(originalHeader => {
          let value = record[originalHeader];
          if (typeof value === 'boolean') {
            value = value ? 1 : 0;
          } else if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value); // Store nested objects/arrays as JSON strings
          }
          return value;
        });
        insertStmt.run(...valuesToInsert);
      }

      db.exec('COMMIT');
      return NextResponse.json({ message: `JSON data imported successfully into table "${tableName}". ${jsonData.length} records inserted.` }, { status: 200 });
    } catch (e: any) {
      db.exec('ROLLBACK');
      console.error("Error processing JSON and inserting into SQLite:", e.message);
      return NextResponse.json({ message: `Error processing JSON: ${e.message}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Outer error processing JSON upload request:", error);
    return NextResponse.json({ message: "Error processing request: " + error.message }, { status: 500 });
  }
}
