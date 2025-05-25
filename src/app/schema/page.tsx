'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Database, Table2, Columns, KeyRound, Type, CheckSquare, Ban, Loader2, AlertTriangle } from "lucide-react";
import type { DatabaseSchemaResponse, TableSchemaFromSQLite, ColumnSchema as SQLiteColumnSchema } from '@/app/api/db/schema/route';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


export default function SchemaPage() {
  const [schema, setSchema] = React.useState<DatabaseSchemaResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTables, setActiveTables] = React.useState<string[]>([]);
  const { toast } = useToast();

  const fetchSchema = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/db/schema'); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: DatabaseSchemaResponse = await response.json();
      setSchema(data);
    } catch (e: any) {
      console.error("Failed to fetch schema:", e);
      setError(e.message || "An unknown error occurred while fetching schema data.");
      setSchema(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);
  
  const handleSeedDatabase = async () => {
    setIsLoading(true); 
    setError(null);
    try {
      const response = await fetch('/api/db/seed', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      toast({
        title: "Database Seeded",
        description: result.message || "Database has been seeded successfully.",
      });
      fetchSchema(); 
    } catch (e: any) {
      console.error("Failed to seed database:", e);
      toast({
        title: "Seed Failed",
        description: e.message || "Could not seed database.",
        variant: "destructive",
      });
      setError(e.message || "Could not seed database.");
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading database schema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Schema Explorer
            </span>
        </h1>
        <Card className="shadow-xl border-destructive/50">
            <CardHeader>
            <CardTitle className="text-xl text-destructive flex items-center">
                <AlertTriangle className="mr-3 h-6 w-6" /> Error Loading Schema
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-destructive-foreground">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
                The SQLite database might be empty or inaccessible. You can try seeding it.
            </p>
            <Button onClick={handleSeedDatabase} className="mt-4" variant="default">
                Seed Database
            </Button>
            </CardContent>
        </Card>
      </>
    );
  }

  if (!schema || !schema.tables || schema.tables.length === 0) {
    return (
      <>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Schema Explorer
            </span>
        </h1>
        <Card className="shadow-xl border-primary/20">
            <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
                <Database className="mr-3 h-6 w-6" /> Schema Explorer
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground">
                No tables found in the SQLite database. You might need to create some tables using the SQL Editor or seed the database.
            </p>
            <Button onClick={handleSeedDatabase} className="mt-4" variant="default">
                Seed Database with Sample Data
            </Button>
            </CardContent>
        </Card>
      </>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Schema Explorer
            </span>
        </h1>
        <Button onClick={handleSeedDatabase} variant="outline">
          Re-Seed Database
        </Button>
      </div>
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <Database className="mr-3 h-6 w-6" /> {schema.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Browse tables and their structures from the SQLite database. Click on a table name to expand its columns and details.
          </p>
          <Accordion
            type="multiple"
            value={activeTables}
            onValueChange={setActiveTables}
            className="w-full space-y-2"
          >
            {schema.tables.map((table: TableSchemaFromSQLite) => (
              <AccordionItem value={table.name} key={table.id} className="border border-border rounded-lg shadow-sm bg-card overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors text-lg">
                  <div className="flex items-center">
                    <Table2 className="mr-3 h-5 w-5 text-primary/80" />
                    <span className="font-semibold">{table.name}</span>
                    {table.rowCount !== undefined && (
                         <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                            {table.rowCount.toLocaleString()} rows
                         </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 bg-muted/30 border-t border-border">
                  {table.description && (
                    <p className="text-sm text-muted-foreground mb-3 italic">{table.description}</p>
                  )}
                  {table.columns.length > 0 ? (
                    <ul className="space-y-2">
                      {table.columns.map((column: SQLiteColumnSchema) => (
                        <li key={column.name} className="flex items-start p-2.5 rounded-md border border-border/70 bg-background shadow-xs hover:shadow-sm transition-shadow">
                          <Columns className="mr-3 h-4 w-4 mt-1 text-secondary-foreground flex-shrink-0" />
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                               <span className="font-medium text-sm text-foreground">{column.name}</span>
                               <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-mono shadow-sm">{column.type}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                              {column.isPrimaryKey && (
                                <div className="flex items-center text-amber-600 dark:text-amber-400">
                                  <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Primary Key
                                </div>
                              )}
                              {column.isForeignKey && (
                                <div className="flex items-center text-blue-600 dark:text-blue-400">
                                  <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Foreign Key (references {column.foreignKeyTable}.{column.foreignKeyColumn})
                                </div>
                              )}
                              <div className="flex items-center">
                                  {column.isNullable === false || column.isPrimaryKey ? (
                                      <><Ban className="mr-1.5 h-3.5 w-3.5 text-red-500" /> NOT NULLABLE</>
                                  ) : (
                                      <><CheckSquare className="mr-1.5 h-3.5 w-3.5 text-green-600" /> NULLABLE</>
                                  )}
                              </div>
                              {column.defaultValue !== undefined && column.defaultValue !== null && (
                                  <div className="flex items-center">
                                      <Type className="mr-1.5 h-3.5 w-3.5"/> Default: <code className="ml-1 text-xs bg-muted px-1 py-0.5 rounded-sm font-mono">{String(column.defaultValue)}</code>
                                  </div>
                              )}
                              {column.description && <p className="pt-0.5">{column.description}</p>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <p className="text-sm text-muted-foreground text-center py-2">No columns defined for this table.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
