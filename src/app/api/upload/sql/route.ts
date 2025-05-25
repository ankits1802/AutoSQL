
// src/app/api/upload/sql/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sqlContent } = await request.json();

    if (typeof sqlContent !== 'string' || sqlContent.trim() === '') {
      return NextResponse.json({ message: 'SQL content is required.' }, { status: 400 });
    }

    // Basic comment stripping (can be enhanced if needed)
    let cleanedSqlContent = sqlContent.replace(/--.*/g, ''); // Remove single-line comments
    cleanedSqlContent = cleanedSqlContent.replace(/\/\*[\s\S]*?\*\/|(\/\*[\s\S]*?\*\/)/g, ''); // Remove multi-line comments
    cleanedSqlContent = cleanedSqlContent.trim();

    if (cleanedSqlContent === '') {
        return NextResponse.json({ message: 'SQL content is empty after removing comments.' }, { status: 400 });
    }
    
    // Execute the SQL script. db.exec can handle multiple statements separated by semicolons.
    // It runs all statements in a single transaction. If any statement fails,
    // the transaction is rolled back, and an error is thrown.
    try {
      db.exec(cleanedSqlContent);
      return NextResponse.json({ message: 'SQL script executed successfully.' }, { status: 200 });
    } catch (e: any) {
      console.error("Error executing SQL script:", e.message);
      return NextResponse.json({ message: `Error executing SQL script: ${e.message}` }, { status: 400 });
    }

  } catch (error: any) {
    // Catch errors from request parsing or initial setup
    console.error("Error processing SQL upload request:", error);
    return NextResponse.json({ message: "Error processing request: " + error.message }, { status: 500 });
  }
}
