
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DatabaseZap, ListChecks, Clock, Hash, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Reverted to alias. If 'Module not found' persists, ensure src/contexts/LastExecutedQueryContext.tsx exists,
// exports the named members, and try clearing the .next cache and restarting the dev server.
import { useLastExecutedQuery, type ApiQueryResultType } from '@/contexts/LastExecutedQueryContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ResultsPage() {
  const { lastExecutedQuery } = useLastExecutedQuery();

  const renderContent = () => {
    if (!lastExecutedQuery || !lastExecutedQuery.sql) {
      return (
        <div className="mt-4 p-8 h-64 w-full rounded-md border border-dashed flex flex-col items-center justify-center bg-muted/50">
          <DatabaseZap className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <p className="text-xl font-medium text-muted-foreground mb-1">No Query Executed Yet</p>
          <p className="text-sm text-muted-foreground/80">Please run a query in the SQL Editor to see results here.</p>
        </div>
      );
    }

    const { sql, results, timestamp } = lastExecutedQuery;

    if (!results) {
         return (
            <div className="mt-4 p-8 h-64 w-full rounded-md border border-dashed flex flex-col items-center justify-center bg-muted/50">
                <AlertTriangle className="h-16 w-16 text-destructive/70 mb-4" />
                <p className="text-xl font-medium text-destructive mb-1">Query Execution Pending or Failed</p>
                <p className="text-sm text-muted-foreground/80">The last initiated query may not have completed or an error occurred before results could be processed.</p>
                 {sql && (
                    <div className="mt-4 w-full max-w-2xl">
                        <h4 className="text-sm font-semibold text-foreground/80 mb-1">Attempted Query:</h4>
                        <ScrollArea className="max-h-[100px] bg-muted/30 rounded-md border p-2">
                            <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{sql}</pre>
                        </ScrollArea>
                    </div>
                 )}
            </div>
        );
    }
    
    if (results.error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Query Execution Error</AlertTitle>
          <AlertDescription>
            <p>{results.error}</p>
            {results.messages && results.messages.length > 0 && results.messages.some(msg => msg !== results.error) && (
              <ScrollArea className="max-h-32 mt-2">
                <ul className="text-xs list-disc list-inside">
                  {results.messages.map((msg: string, i: number) => <li key={i}>{msg}</li>)}
                </ul>
              </ScrollArea>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    // DML/DDL messages handling (when no rows/columns are primary output)
    if (results.messages && results.messages.length > 0 && (!results.rows || results.rows.length === 0) && (!results.columns || results.columns.length === 0)) {
      const isLikelyError = results.messages.some(m => m.toLowerCase().includes("error"));
      const alertVariant = isLikelyError ? "destructive" : "default";
      const iconColor = isLikelyError ? "text-destructive" : "text-green-600";
      const titleColor = isLikelyError ? "text-destructive" : "text-green-700";
      const textColor = isLikelyError ? "text-destructive-foreground" : "text-green-600"; // For list items
      const IconComponent = isLikelyError ? AlertTriangle : ListChecks;

      return (
        <Alert variant={alertVariant} className={`m-4 ${isLikelyError ? '' : 'bg-green-500/10 border-green-500/30'}`}>
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
          <AlertTitle className={titleColor}>Execution Summary</AlertTitle>
          <ScrollArea className="max-h-40">
            <ul className={`list-disc list-inside text-sm ${textColor}`}>
              {results.messages.map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </ScrollArea>
          {results.changes !== undefined && <p className={`text-xs ${isLikelyError ? 'text-destructive-foreground/80' : 'text-green-500'} mt-1`}>Total rows affected: {String(results.changes)}</p>}
          {results.lastInsertRowid !== undefined && Number(results.lastInsertRowid) > 0 && <p className={`text-xs ${isLikelyError ? 'text-destructive-foreground/80' : 'text-green-500'} mt-1`}>Last inserted row ID: {String(results.lastInsertRowid)}</p>}
        </Alert>
      );
    }
    
    // Table display for SELECT results
    if (results.rows && results.rows.length > 0 && results.columns && results.columns.length > 0) {
      return (
        <ScrollArea className="w-full h-auto max-h-[calc(100vh-480px)] md:max-h-[calc(100vh-450px)] border rounded-lg shadow-inner">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-card z-10 border-b shadow-sm">
              <TableRow>
                {results.columns.map((col) => (
                  <TableHead key={col} className="font-semibold text-sm text-foreground whitespace-nowrap px-4 py-3">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50 transition-colors duration-150 even:bg-muted/20">
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="text-sm text-foreground/90 whitespace-nowrap px-4 py-2.5">
                      {cell === null ? <span className="italic text-muted-foreground/70">NULL</span> : String(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      );
    }

    // Fallback for SELECT queries that return columns but no rows
    if (results.columns && results.columns.length > 0 && (!results.rows || results.rows.length === 0)) {
      return (
        <ScrollArea className="w-full h-auto max-h-[300px] border rounded-lg shadow-inner">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-card z-10 border-b shadow-sm">
              <TableRow>
                {results.columns.map(col => <TableHead key={col} className="font-semibold text-sm text-foreground whitespace-nowrap px-4 py-3">{col}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={results.columns.length} className="text-center text-muted-foreground py-10 h-48">
                  Query executed successfully, but no rows were returned.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      );
    }
    
    // If no specific condition above matched (e.g. results object exists but is empty for an unknown reason)
     return (
        <div className="mt-4 p-8 h-64 w-full rounded-md border border-dashed flex flex-col items-center justify-center bg-muted/50">
          <DatabaseZap className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <p className="text-xl font-medium text-muted-foreground mb-1">Query Processed</p>
          <p className="text-sm text-muted-foreground/80">The query was processed, but it might not have produced a standard tabular output or messages. Check the editor for details.</p>
        </div>
      );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Results Viewer
        </span>
      </h1>
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-xl text-primary flex items-center">
                <ListChecks className="mr-3 h-6 w-6" /> Detailed Result Set
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {lastExecutedQuery?.timestamp ? `Executed on: ${lastExecutedQuery.timestamp.toLocaleString()}` : 'No query executed yet.'}
              </p>
            </div>
            {lastExecutedQuery?.results && !lastExecutedQuery.results.error && (
              <div className="text-right space-y-1 mt-2 sm:mt-0">
                  {lastExecutedQuery.results.executionTime !== undefined && (
                    <Badge variant="secondary" className="flex items-center text-xs whitespace-nowrap">
                        <Clock className="mr-1.5 h-3.5 w-3.5" /> Execution Time: {lastExecutedQuery.results.executionTime}
                    </Badge>
                  )}
                  {lastExecutedQuery.results.rowCount !== undefined && (
                    <Badge variant="secondary" className="flex items-center text-xs whitespace-nowrap ml-0 sm:ml-2 mt-1 sm:mt-0">
                        <Hash className="mr-1.5 h-3.5 w-3.5" /> Rows Returned: {lastExecutedQuery.results.rowCount}
                    </Badge>
                  )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {lastExecutedQuery?.sql && (
            <div className="mb-4 p-3 bg-muted/50 rounded-md border border-border shadow-sm">
              <h4 className="text-sm font-semibold text-foreground/80 mb-1">Executed Query:</h4>
              <ScrollArea className="max-h-[100px]">
                <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{lastExecutedQuery.sql}</pre>
              </ScrollArea>
            </div>
          )}
          {renderContent()}
        </CardContent>
         <CardFooter className="border-t pt-4 pb-4 text-xs text-muted-foreground">
            This page displays details of the last query executed in the SQL Editor during this session.
        </CardFooter>
      </Card>
    </div>
  );
}
