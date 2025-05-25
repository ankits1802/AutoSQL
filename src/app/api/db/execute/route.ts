
// src/app/api/db/execute/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    let { sqlQuery } = await request.json();

    if (typeof sqlQuery !== 'string' || sqlQuery.trim() === '') {
      return NextResponse.json({ message: 'SQL query is required.' }, { status: 400 });
    }

    // Strip single-line comments (--)
    sqlQuery = sqlQuery.replace(/--.*/g, '');
    // Strip multi-line comments (/* ... */)
    // This regex handles nested comments poorly but is usually sufficient for typical SQL.
    // For robust multi-line comment removal that handles nesting, a more complex parser might be needed,
    // but this covers most common cases.
    sqlQuery = sqlQuery.replace(/\/\*[\s\S]*?\*\/|(\/\*[\s\S]*?\*\/)/g, '');


    // Split queries by semicolon, filter out empty ones, and trim whitespace
    const statements = sqlQuery
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    if (statements.length === 0) {
      return NextResponse.json({ message: 'No valid SQL statements found after removing comments.' }, { status: 400 });
    }

    let executionResults: {
        columns: string[];
        rows: any[][];
        rowCount: number;
        changes: number | bigint;
        lastInsertRowid: number | bigint;
        messages: string[];
        error?: string; // Added error field for specific statement errors
    } = {
        columns: [],
        rows: [],
        rowCount: 0,
        changes: 0,
        lastInsertRowid: 0,
        messages: []
    };
    
    let totalChanges = 0;
    let overallLastInsertRowid: number | bigint = 0;

    const executionTimeStart = performance.now();

    db.exec('BEGIN TRANSACTION');

    try {
      for (const stmtStr of statements) {
        if (stmtStr.trim() === '') continue; // Skip if statement is empty after comment removal and trim

        const stmtLower = stmtStr.toLowerCase();
        
        let stmt;
        try {
          stmt = db.prepare(stmtStr);
        } catch (e: any) {
          db.exec('ROLLBACK TRANSACTION');
          executionResults.messages.push(`Error preparing statement: "${stmtStr.substring(0,100)}${stmtStr.length > 100 ? '...' : ''}". Error: ${e.message}`);
          return NextResponse.json({
            ...executionResults,
            error: `Error preparing statement: "${stmtStr.substring(0,100)}${stmtStr.length > 100 ? '...' : ''}". Error: ${e.message}`,
          }, { status: 400 });
        }


        if (stmtLower.startsWith('select') || (stmtLower.startsWith('pragma') && stmt.reader)) {
          let currentRows: Record<string, any>[] = [];
          let currentColumns: string[] = [];
          try {
            currentRows = stmt.all();
            if (currentRows.length > 0) {
              currentColumns = Object.keys(currentRows[0]);
              executionResults.columns = currentColumns;
              executionResults.rows = currentRows.map(objRow => currentColumns.map(colName => objRow[colName]));
              executionResults.rowCount = currentRows.length;
            } else {
              executionResults.columns = []; 
              try {
                 const colInfo = stmt.columns();
                 executionResults.columns = colInfo.map(c => c.name);
              } catch(e) {
                 executionResults.columns = [];
              }
              executionResults.rows = [];
              executionResults.rowCount = 0;
            }
            executionResults.messages.push(`SELECT statement executed, ${currentRows.length} row(s) returned.`);
          } catch (e: any) {
            db.exec('ROLLBACK TRANSACTION');
            executionResults.messages.push(`Error executing SELECT/PRAGMA: "${stmtStr.substring(0,100)}${stmtStr.length > 100 ? '...' : ''}". Error: ${e.message}`);
            return NextResponse.json({
              ...executionResults,
              error: `Error executing SELECT/PRAGMA: "${stmtStr.substring(0,100)}${stmtStr.length > 100 ? '...' : ''}". Error: ${e.message}`,
            }, { status: 400 });
          }
        } else if (
          stmtLower.startsWith('insert') ||
          stmtLower.startsWith('update') ||
          stmtLower.startsWith('delete') ||
          stmtLower.startsWith('create') ||
          stmtLower.startsWith('alter') ||
          stmtLower.startsWith('drop') ||
          stmtLower.startsWith('pragma') // Non-reader PRAGMAs
        ) {
          try {
            const info = stmt.run();
            totalChanges += Number(info.changes);
            if (stmtLower.startsWith('insert') && info.lastInsertRowid > 0) {
              overallLastInsertRowid = info.lastInsertRowid;
            }
            let successMsg = `Statement executed successfully. ${info.changes} row(s) affected.`;
            if(stmtLower.startsWith('create')) successMsg = `Table/View created successfully.`; // Simplified message
            if(stmtLower.startsWith('drop')) successMsg = `Table/View dropped successfully.`; // Simplified message
            if(stmtLower.startsWith('alter')) successMsg = `Table altered successfully.`; // Simplified message
            
            executionResults.messages.push(successMsg);
          } catch (e: any) {
            db.exec('ROLLBACK TRANSACTION');
            executionResults.messages.push(`Error executing DML/DDL: "${stmtStr.substring(0,100)}${stmtStr.length > 100 ? '...' : ''}". Error: ${e.message}`);
            return NextResponse.json({
              ...executionResults,
              error: `Error executing DML/DDL: "${stmtStr.substring(0,100)}${stmtStr.length > 100 ? '...' : ''}". Error: ${e.message}`,
            }, { status: 400 });
          }
        } else {
           try {
            stmt.run(); 
            executionResults.messages.push(`Statement "${stmtStr.substring(0,30)}..." executed.`);
           } catch (e: any) {
            db.exec('ROLLBACK TRANSACTION');
            executionResults.messages.push(`Unsupported or invalid SQL statement: "${stmtStr.substring(0,100)}${stmtStr.length > 100 ? '...' : ''}". Error: ${e.message}`);
             return NextResponse.json({
                ...executionResults,
                error: `Unsupported or invalid SQL statement: "${stmtStr.substring(0,100)}${stmtStr.length > 100 ? '...' : ''}". Error: ${e.message}`,
              }, { status: 400 });
           }
        }
      }
      db.exec('COMMIT TRANSACTION');
    } catch (error: any) { // Catch errors from within the transaction loop if not caught by specific statement error handling
      if (db.inTransaction) { // Ensure rollback only if transaction is still active
        db.exec('ROLLBACK TRANSACTION');
      }
      console.error("Error during multi-statement execution:", error);
      executionResults.messages.push(`Transaction failed. Error: ${error.message}`);
      return NextResponse.json({
        ...executionResults,
        error: `Transaction failed. Error: ${error.message}`,
      }, { status: 500 });
    }
    
    const executionTimeEnd = performance.now();
    const executionTime = (executionTimeEnd - executionTimeStart).toFixed(2) + 'ms';

    executionResults.changes = totalChanges;
    executionResults.lastInsertRowid = overallLastInsertRowid;
    
    // If there was no explicit SELECT to populate columns/rows, but messages exist (e.g. DML/DDL ops)
    if (executionResults.rows.length === 0 && executionResults.columns.length === 0 && executionResults.messages.length > 0 && !executionResults.error) {
        // This is primarily for DML/DDL operations that don't return rowsets
        // but we want to signal success clearly if messages are present.
        // No need to change executionResults columns/rows here, they are correctly empty.
    }


    return NextResponse.json({ 
        ...executionResults,
        executionTime,
    }, { status: 200 });

  } catch (error: any) {
    // Catch errors from request parsing or initial setup
    console.error("Outer error executing query:", error);
    return NextResponse.json({ 
        message: "Error processing request: " + error.message, 
        error: error.message, 
        columns: [], 
        rows: [],
        messages: []
    }, { status: 500 });
  }
}

