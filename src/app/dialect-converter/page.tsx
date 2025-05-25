
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Code2, ArrowRightLeft, RotateCcw, Lightbulb, Copy, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { convertSqlDialect, type ConvertSqlDialectOutput, type ConvertSqlDialectInput, type DialectChoice } from '@/ai/flows/convert-sql-dialect';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DIALECT_OPTIONS: { value: DialectChoice; label: string }[] = [
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "sqlserver", label: "SQL Server (MSSQL)" },
  { value: "oracle", label: "Oracle PL/SQL" },
  { value: "generic", label: "Generic SQL" },
];

export default function DialectConverterPage() {
  const { toast } = useToast();
  const [fromDialect, setFromDialect] = React.useState<DialectChoice>(DIALECT_OPTIONS[0].value);
  const [toDialect, setToDialect] = React.useState<DialectChoice>(DIALECT_OPTIONS[2].value);
  const [sqlInput, setSqlInput] = React.useState<string>('');
  const [sqlOutput, setSqlOutput] = React.useState<string>('');
  const [conversionNotes, setConversionNotes] = React.useState<string[] | undefined>(undefined);
  const [isConverting, setIsConverting] = React.useState<boolean>(false);
  const [conversionError, setConversionError] = React.useState<string | null>(null);


  const handleSwapDialects = () => {
    const tempFrom = fromDialect;
    const tempInput = sqlInput;
    setFromDialect(toDialect);
    setToDialect(tempFrom);
    if (sqlOutput) {
      setSqlInput(sqlOutput);
      setSqlOutput(tempInput); 
      setConversionNotes(undefined);
      setConversionError(null);
    }
  };

  const handleReset = () => {
    setFromDialect(DIALECT_OPTIONS[0].value);
    setToDialect(DIALECT_OPTIONS[2].value);
    setSqlInput('');
    setSqlOutput('');
    setConversionNotes(undefined);
    setConversionError(null);
    toast({ title: "Converter Reset", description: "Inputs have been cleared." });
  };

  const handleConvert = async () => {
    if (!sqlInput.trim()) {
      setConversionError("Please enter some SQL to convert.");
      toast({
        title: "Input Required",
        description: "Please enter some SQL to convert.",
        variant: "destructive",
      });
      return;
    }
    if (fromDialect === toDialect) {
      setSqlOutput(sqlInput);
      setConversionNotes(["Source and target dialects are the same. No conversion performed."]);
      setConversionError(null);
      toast({
        title: "Same Dialects",
        description: "Source and target dialects are the same. No conversion needed.",
        variant: "info",
      });
      return;
    }

    setIsConverting(true);
    setSqlOutput('');
    setConversionNotes(undefined);
    setConversionError(null);

    try {
      const inputData: ConvertSqlDialectInput = {
        sqlQuery: sqlInput,
        sourceDialect: fromDialect,
        targetDialect: toDialect,
      };
      const result: ConvertSqlDialectOutput = await convertSqlDialect(inputData);
      setSqlOutput(result.convertedSqlQuery);
      if (result.notes && result.notes.length > 0) {
        setConversionNotes(result.notes);
      } else {
        setConversionNotes(undefined);
      }
      toast({
        title: "Conversion Successful",
        description: `SQL query converted to ${DIALECT_OPTIONS.find(d => d.value === toDialect)?.label || toDialect} dialect.`,
        variant: "default"
      });
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred during conversion.";
      console.error("Conversion error:", err);
      setConversionError(errorMessage);
      setSqlOutput(''); 
      setConversionNotes(undefined);
      toast({
        title: "Conversion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopyOutput = () => {
    if (!sqlOutput) {
      toast({ title: "Nothing to copy", description: "Output is empty.", variant: "info" });
      return;
    }
    navigator.clipboard.writeText(sqlOutput)
      .then(() => {
        toast({ title: "Copied to clipboard!", variant: "default" });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({ title: "Failed to copy", description: "Could not copy text to clipboard.", variant: "destructive" });
      });
  };

  const consoleOutputClasses = "min-h-[150px] mt-1 text-sm font-mono bg-muted/80 dark:bg-slate-800 dark:text-slate-100 rounded-lg p-4 shadow-inner border border-border/50 focus:ring-primary/50";

  return (
    <div className="space-y-6">
       <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          SQL Dialect Converter
        </span>
      </h1>

      <Card className="shadow-lg max-w-3xl mx-auto border-primary/20">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-1">
            <Code2 className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-semibold text-primary">Convert with ease</CardTitle>
          </div>
          <CardDescription className="text-base text-muted-foreground">
            Translate SQL queries between different database dialects using AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <div>
              <Label htmlFor="from-dialect" className="text-sm font-medium">From Dialect</Label>
              <Select value={fromDialect} onValueChange={(value) => setFromDialect(value as DialectChoice)} disabled={isConverting}>
                <SelectTrigger id="from-dialect" className="w-full mt-1 text-base rounded-lg">
                  <SelectValue placeholder="Select source dialect" />
                </SelectTrigger>
                <SelectContent>
                  {DIALECT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-base">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapDialects}
              disabled={isConverting}
              className="h-10 w-10 border-border hover:bg-accent group rounded-lg"
              aria-label="Swap dialects"
            >
              <ArrowRightLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
            
            <div>
              <Label htmlFor="to-dialect" className="text-sm font-medium">To Dialect</Label>
              <Select value={toDialect} onValueChange={(value) => setToDialect(value as DialectChoice)} disabled={isConverting}>
                <SelectTrigger id="to-dialect" className="w-full mt-1 text-base rounded-lg">
                  <SelectValue placeholder="Select target dialect" />
                </SelectTrigger>
                <SelectContent>
                  {DIALECT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-base">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="sql-input" className="text-sm font-medium">SQL to Convert</Label>
            <Textarea
              id="sql-input"
              placeholder="Paste your SQL query here... e.g., SELECT * FROM users LIMIT 10;"
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              className="min-h-[150px] mt-1 text-sm font-mono rounded-lg p-4"
              disabled={isConverting}
            />
          </div>
          
          {conversionError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Conversion Error</CardTitle> {/* Using CardTitle for consistent heading style */}
              <AlertDescription>{conversionError}</AlertDescription>
            </Alert>
          )}

          {(sqlOutput || isConverting || (conversionNotes && conversionNotes.length > 0)) && (
            <div className="space-y-2">
              <Label htmlFor="sql-output" className="text-sm font-medium">Converted SQL</Label>
              <div className="relative group">
                <Textarea
                  id="sql-output"
                  value={sqlOutput}
                  readOnly
                  className={cn(consoleOutputClasses)}
                  placeholder={isConverting ? "AI is converting..." : "Converted SQL will appear here..."}
                />
                {sqlOutput && !isConverting && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:opacity-100 hover:text-primary"
                    onClick={handleCopyOutput}
                    title="Copy converted SQL"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {conversionNotes && conversionNotes.length > 0 && !isConverting && (
                <div className="mt-2">
                  <Label className="text-xs font-medium text-muted-foreground">Conversion Notes:</Label>
                  <ul className="list-disc list-inside pl-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border shadow-sm">
                    {conversionNotes.map((note, index) => (
                      <li key={index} className="py-0.5">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-end space-x-3 pt-6 border-t border-border">
          <Button variant="outline" onClick={handleReset} className="text-base px-6 py-2.5 rounded-lg" disabled={isConverting}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button
            onClick={handleConvert}
            disabled={isConverting || !sqlInput.trim()}
            variant="success"
            className="text-base px-8 py-2.5 rounded-lg" 
          >
            {isConverting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            {isConverting ? 'Converting...' : 'Convert'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
