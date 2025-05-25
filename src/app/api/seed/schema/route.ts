
// This file (/api/seed/schema/route.ts) was for Firestore schema seeding.
// It is now replaced by /api/db/seed/route.ts for SQLite.
// This file can be deleted or kept empty.
// For safety, returning a clear message if it's accidentally called.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { 
      message: "This schema seeding endpoint is deprecated. Please use /api/db/seed to seed the SQLite database.",
      deprecated: true 
    }, 
    { status: 410 } // Gone
  );
}
