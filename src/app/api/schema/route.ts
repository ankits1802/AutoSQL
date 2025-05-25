
// This file (/api/schema/route.ts) was for Firestore schema.
// It is now replaced by /api/db/schema/route.ts for SQLite.
// This file can be deleted or kept empty.
// For safety, returning a clear message if it's accidentally called.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      message: "This schema endpoint is deprecated. Please use /api/db/schema for SQLite schema.",
      deprecated: true 
    }, 
    { status: 410 } // Gone
  );
}
