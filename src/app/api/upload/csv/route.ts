
// src/app/api/upload/csv/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import Papa from 'papaparse';

// Helper to sanitize table and column names
const sanitizeName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+|_+$/g, '');
};

// Helper to infer SQLite data type from a value
const inferSqliteType = (value: string): string => {
  if (value === null || value === undefined || value.trim() === '') return 'TEXT'; // Default to TEXT for empty or null
  if (!isNaN(parseFloat(value)) && isFinite(Number(value))) { // Check if it's a number
    if (Number.isInteger(parseFloat(value))) { // Check if it's an integer
      // If it looks like a large integer that might exceed JS safe int, treat as TEXT to be safe,
      // or keep as INTEGER and let SQLite handle it (SQLite integers can be very large).
      // For simplicity, we'll assume INTEGER for now.
      return 'INTEGER';
    }
    return 'REAL'; // It's a float
  }
  // Could add more checks here, e.g., for dates, booleans ("true", "false")
  return 'TEXT'; // Default to TEXT
};

export async function POST(request: NextRequest) {
  try {
    const { fileName, csvContent } = await request.json();

    if (typeof fileName !== 'string' || fileName.trim() === '') {
      return NextResponse.json({ message: 'File name is required.' }, { status: 400 });
    }
    if (typeof csvContent !== 'string' || csvContent.trim() === '') {
      return NextResponse.json({ message: 'CSV content is required.' }, { status: 400 });
    }

    const baseTableName = sanitizeName(fileName.split('.').slice(0, -1).join('_') || 'csv_import');
    let tableName = baseTableName;
    let tableSuffix = 1;

    // Ensure unique table name
    const checkTableExistsStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?");
    while (checkTableExistsStmt.get(tableName)) {
      tableName = `${baseTableName}_${tableSuffix}`;
      tableSuffix++;
    }


    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep everything as string initially for our type inference
    });

    if (parseResult.errors.length > 0) {
      console.error("CSV parsing errors:", parseResult.errors);
      return NextResponse.json({ message: `Error parsing CSV: ${parseResult.errors.map(e => e.message).join(', ')}` }, { status: 400 });
    }

    const headers = parseResult.meta.fields;
    if (!headers || headers.length === 0) {
      return NextResponse.json({ message: 'CSV must have a header row.' }, { status: 400 });
    }

    const sanitizedHeaders = headers.map(h => sanitizeName(h || `column_${headers.indexOf(h)}`));
    
    const dataRows = parseResult.data as Record<string, string>[]; // All values are strings
    if (dataRows.length === 0) {
      return NextResponse.json({ message: 'CSV has no data rows to process.' }, { status: 400 });
    }

    // Infer column types from the first few data rows (e.g., up to 10 rows or all if fewer)
    const sampleRows = dataRows.slice(0, 10);
    const columnTypes: Record<string, string> = {};

    sanitizedHeaders.forEach((header, index) => {
      const originalHeader = headers[index]; // Use original header for accessing data
      let determinedType = 'TEXT'; // Default
      for (const row of sampleRows) {
        const value = row[originalHeader];
        if (value !== null && value !== undefined && value.trim() !== '') {
          const currentType = inferSqliteType(value);
          if (determinedType === 'TEXT' && currentType !== 'TEXT') {
            determinedType = currentType; // Prefer more specific type
          } else if (determinedType === 'INTEGER' && currentType === 'REAL') {
            determinedType = 'REAL'; // Upgrade INTEGER to REAL if a float is found
          }
        }
      }
      columnTypes[header] = determinedType;
    });
    
    const columnDefinitions = sanitizedHeaders.map(header => `"${header}" ${columnTypes[header]}`).join(', ');
    const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefinitions});`;

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(createTableSql).run();

      const placeholders = sanitizedHeaders.map(() => '?').join(', ');
      const insertSql = `INSERT INTO "${tableName}" (${sanitizedHeaders.map(h => `"${h}"`).join(', ')}) VALUES (${placeholders});`;
      const insertStmt = db.prepare(insertSql);

      for (const row of dataRows) {
        const valuesToInsert = headers.map(originalHeader => {
           const val = row[originalHeader];
           // Basic conversion based on inferred type for SQLite (it's quite flexible with TEXT)
           const colType = columnTypes[sanitizeName(originalHeader)];
           if (val === null || val === undefined || val.trim() === '') return null;
           if (colType === 'INTEGER') return parseInt(val, 10);
           if (colType === 'REAL') return parseFloat(val);
           return val; // TEXT
        });
        insertStmt.run(...valuesToInsert);
      }

      db.exec('COMMIT');
      return NextResponse.json({ message: `CSV data imported successfully into table "${tableName}". ${dataRows.length} rows inserted.` }, { status: 200 });
    } catch (e: any) {
      db.exec('ROLLBACK');
      console.error("Error processing CSV and inserting into SQLite:", e.message);
      return NextResponse.json({ message: `Error processing CSV: ${e.message}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Outer error processing CSV upload request:", error);
    return NextResponse.json({ message: "Error processing request: " + error.message }, { status: 500 });
  }
}
