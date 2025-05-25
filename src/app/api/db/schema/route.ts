
// src/app/api/db/schema/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ColumnSchema {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignKeyTable?: string;
  foreignKeyColumn?: string;
  isNullable?: boolean;
  defaultValue?: string | number | boolean | null; // dflt_value can be null
  description?: string; // SQLite doesn't store this by default
}

export interface TableSchemaFromSQLite {
  id: string; // Table name
  name: string; // Table name
  columns: ColumnSchema[];
  description?: string; // Optional, as SQLite doesn't store this directly
  rowCount?: number;
}

export interface DatabaseSchemaResponse {
  name: string; // e.g., "SQLite Database"
  tables: TableSchemaFromSQLite[];
}

export async function GET() {
  try {
    const databaseName = "SQLite Database"; // Or derive from db file name if needed

    // Get all table names
    const tablesQuery = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`);
    const tableRows = tablesQuery.all() as { name: string }[];

    const tables: TableSchemaFromSQLite[] = [];

    for (const tableRow of tableRows) {
      const tableName = tableRow.name;

      // Get column info
      const columnsInfoQuery = db.prepare(`PRAGMA table_info('${tableName}');`);
      const columnInfos = columnsInfoQuery.all() as {
        cid: number;
        name: string;
        type: string;
        notnull: 0 | 1;
        dflt_value: string | null;
        pk: 0 | 1;
      }[];

      const columns: ColumnSchema[] = columnInfos.map(col => ({
        name: col.name,
        type: col.type.toUpperCase(), // Standardize type casing
        isPrimaryKey: col.pk === 1,
        isNullable: col.notnull === 0,
        defaultValue: col.dflt_value,
      }));

      // Get foreign key info (more complex, requires PRAGMA foreign_key_list)
      const fkQuery = db.prepare(`PRAGMA foreign_key_list('${tableName}');`);
      const fkInfos = fkQuery.all() as {
        id: number;
        seq: number;
        table: string; // Referenced table
        from: string; // Column in this table
        to: string;   // Column in referenced table
        on_update: string;
        on_delete: string;
        match: string;
      }[];

      fkInfos.forEach(fk => {
        const colToUpdate = columns.find(c => c.name === fk.from);
        if (colToUpdate) {
          colToUpdate.isForeignKey = true;
          colToUpdate.foreignKeyTable = fk.table;
          colToUpdate.foreignKeyColumn = fk.to;
        }
      });
      
      // Get row count
      let rowCount: number | undefined = undefined;
      try {
        const countResult = db.prepare(`SELECT COUNT(*) as count FROM "${tableName}";`).get() as { count: number };
        rowCount = countResult.count;
      } catch (e) {
        console.warn(`Could not get row count for table ${tableName}:`, e);
      }


      tables.push({
        id: tableName,
        name: tableName,
        columns,
        rowCount,
        // description: `Description for ${tableName}` // Mock or omit
      });
    }

    const responseData: DatabaseSchemaResponse = {
      name: databaseName,
      tables: tables,
    };
    
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching SQLite schema data:", error);
    return NextResponse.json({ message: "Error fetching SQLite schema data", error: error.message }, { status: 500 });
  }
}
