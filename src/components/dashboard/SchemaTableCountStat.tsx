
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Database, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import type { DatabaseSchemaResponse } from '@/app/api/db/schema/route'; // Updated import path
import { Button } from '../ui/button';
import Link from 'next/link';

export function SchemaTableCountStat() {
  const [tableCount, setTableCount] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSchemaCount = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/db/schema'); // Updated API endpoint
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch schema: ${response.statusText}`);
        }
        const data: DatabaseSchemaResponse = await response.json();
        setTableCount(data.tables.length);
      } catch (e: any) {
        setError(e.message || "Could not load table count.");
        setTableCount(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemaCount();
  }, []);

  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Tables in Schema</CardTitle>
        <Database className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            <span className="text-2xl font-bold text-muted-foreground">Loading...</span>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-8 w-8" />
             <span className="text-lg font-bold">Error</span>
          </div>
        )}
        {!isLoading && !error && tableCount !== null && (
          <div className="text-3xl font-bold text-foreground">{tableCount}</div>
        )}
        {!isLoading && error && <p className="text-xs text-destructive pt-1">{error}</p>}
        {!isLoading && !error && tableCount !== null && <p className="text-xs text-muted-foreground pt-1">Reflecting current SQLite database.</p>}
      </CardContent>
      {!isLoading && !error && tableCount !== null && (
         <CardFooter className="pt-0">
            <Button size="sm" variant="link" asChild className="px-0 text-xs">
            <Link href="/schema">
                Explore Schema <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
