
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  PlayCircle,
  DatabaseZap,
  Save,
  BarChartBig,
  Languages,
  Copy,
  Eraser,
  Download,
  Mic,
  MicOff,
  Plus,
  X,
  FileText,
  TableIcon,
  FileJson,
  CheckCircle,
} from "lucide-react";
import { optimizeSql, type OptimizeSqlOutput } from '@/ai/flows/optimize-sql';
import { suggestSql, type SuggestSqlOutput } from '@/ai/flows/suggest-sql';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLastExecutedQuery, type ApiQueryResultType } from '@/contexts/LastExecutedQueryContext';


const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Loading Editor...</p>
    </div>
  ),
});


interface QueryTab {
  id: string;
  firestoreId: string | null; 
  name: string;
  sql: string;
  queryResults: ApiQueryResultType | null; 
  aiResponse: OptimizeSqlOutput | null; 
  isExecutingQuery: boolean;
  isLoadingAi: boolean;
  aiError: string | null;
}

const SQL_COMPLETION_ITEMS = [
  // DQL
  { label: 'SELECT', kind: 17 /* Keyword */, insertText: 'SELECT ${1:columns} FROM ${2:table};', detail: 'Statement', documentation: 'Retrieves data from one or more tables.' },
  { label: 'FROM', kind: 17, insertText: 'FROM ', detail: 'Clause', documentation: 'Specifies the table to retrieve records from.' },
  { label: 'WHERE', kind: 17, insertText: 'WHERE ${1:condition}', detail: 'Clause', documentation: 'Filters records based on a condition.' },
  { label: 'GROUP BY', kind: 17, insertText: 'GROUP BY ${1:column}', detail: 'Clause', documentation: 'Groups rows that have the same values in specified columns.' },
  { label: 'HAVING', kind: 17, insertText: 'HAVING ${1:condition}', detail: 'Clause', documentation: 'Filters groups based on a condition.' },
  { label: 'ORDER BY', kind: 17, insertText: 'ORDER BY ${1:column} ${2:ASC|DESC}', detail: 'Clause', documentation: 'Sorts the result set.' },
  { label: 'LIMIT', kind: 17, insertText: 'LIMIT ${1:count}', detail: 'Clause', documentation: 'Constrains the number of rows returned.' },
  { label: 'OFFSET', kind: 17, insertText: 'OFFSET ${1:count}', detail: 'Clause', documentation: 'Skips a specified number of rows before starting to return rows.' },
  { label: 'AS', kind: 17, insertText: 'AS ', detail: 'Keyword', documentation: 'Renames a column or table with an alias.' },
  { label: 'DISTINCT', kind: 17, insertText: 'DISTINCT ', detail: 'Keyword', documentation: 'Returns only unique values.' },
  // DML
  { label: 'INSERT INTO', kind: 17, insertText: 'INSERT INTO ${1:table_name} (${2:column1}, ${3:column2}) VALUES (${4:value1}, ${5:value2});', detail: 'Statement', documentation: 'Inserts new records into a table.' },
  { label: 'VALUES', kind: 17, insertText: 'VALUES ', detail: 'Clause' },
  { label: 'UPDATE', kind: 17, insertText: 'UPDATE ${1:table_name} SET ${2:column1} = ${3:value1} WHERE ${4:condition};', detail: 'Statement', documentation: 'Modifies existing records in a table.' },
  { label: 'SET', kind: 17, insertText: 'SET ', detail: 'Clause' },
  { label: 'DELETE', kind: 17, insertText: 'DELETE FROM ${1:table_name} WHERE ${2:condition};', detail: 'Statement', documentation: 'Deletes records from a table.' },
  // DDL
  { label: 'CREATE TABLE', kind: 17, insertText: 'CREATE TABLE ${1:table_name} (\n  ${2:column1} ${3:datatype},\n  ${4:column2} ${5:datatype}\n);', detail: 'Statement', documentation: 'Creates a new table.' },
  { label: 'ALTER TABLE', kind: 17, insertText: 'ALTER TABLE ${1:table_name} ADD ${2:column_name} ${3:datatype};', detail: 'Statement', documentation: 'Modifies an existing table structure.' },
  { label: 'DROP TABLE', kind: 17, insertText: 'DROP TABLE ${1:table_name};', detail: 'Statement', documentation: 'Deletes a table.' },
  { label: 'CREATE INDEX', kind: 17, insertText: 'CREATE INDEX ${1:index_name} ON ${2:table_name} (${3:column});', detail: 'Statement', documentation: 'Creates an index on a table.' },
  { label: 'DROP INDEX', kind: 17, insertText: 'DROP INDEX ${1:index_name};', detail: 'Statement', documentation: 'Deletes an index.' },
  // Data Types
  { label: 'INTEGER', kind: 21 /* TypeParameter */, insertText: 'INTEGER', detail: 'Data Type' },
  { label: 'TEXT', kind: 21, insertText: 'TEXT', detail: 'Data Type' },
  { label: 'REAL', kind: 21, insertText: 'REAL', detail: 'Data Type' },
  { label: 'BLOB', kind: 21, insertText: 'BLOB', detail: 'Data Type' },
  { label: 'VARCHAR', kind: 21, insertText: 'VARCHAR(${1:size})', detail: 'Data Type' },
  { label: 'BOOLEAN', kind: 21, insertText: 'BOOLEAN', detail: 'Data Type' },
  { label: 'DATE', kind: 21, insertText: 'DATE', detail: 'Data Type' },
  { label: 'DATETIME', kind: 21, insertText: 'DATETIME', detail: 'Data Type' },
  // Operators & Keywords
  { label: 'AND', kind: 13 /* Operator */, insertText: 'AND ', detail: 'Operator' },
  { label: 'OR', kind: 13, insertText: 'OR ', detail: 'Operator' },
  { label: 'NOT', kind: 13, insertText: 'NOT ', detail: 'Operator' },
  { label: 'IN', kind: 17, insertText: 'IN ()', detail: 'Operator' },
  { label: 'BETWEEN', kind: 17, insertText: 'BETWEEN ${1:min} AND ${2:max}', detail: 'Operator' },
  { label: 'LIKE', kind: 17, insertText: "LIKE '${1:%pattern%}'", detail: 'Operator' },
  { label: 'IS NULL', kind: 17, insertText: 'IS NULL', detail: 'Operator' },
  { label: 'IS NOT NULL', kind: 17, insertText: 'IS NOT NULL', detail: 'Operator' },
  { label: 'EXISTS', kind: 17, insertText: 'EXISTS ()', detail: 'Operator' },
  // Join Types
  { label: 'JOIN', kind: 17, insertText: 'JOIN ${1:table} ON ${2:condition}', detail: 'Join Type' },
  { label: 'INNER JOIN', kind: 17, insertText: 'INNER JOIN ${1:table} ON ${2:condition}', detail: 'Join Type' },
  { label: 'LEFT JOIN', kind: 17, insertText: 'LEFT JOIN ${1:table} ON ${2:condition}', detail: 'Join Type' },
  { label: 'RIGHT JOIN', kind: 17, insertText: 'RIGHT JOIN ${1:table} ON ${2:condition}', detail: 'Join Type' },
  { label: 'FULL OUTER JOIN', kind: 17, insertText: 'FULL OUTER JOIN ${1:table} ON ${2:condition}', detail: 'Join Type' },
  // Constraints
  { label: 'PRIMARY KEY', kind: 17, insertText: 'PRIMARY KEY', detail: 'Constraint' },
  { label: 'FOREIGN KEY', kind: 17, insertText: 'FOREIGN KEY (${1:column}) REFERENCES ${2:table}(${3:column})', detail: 'Constraint' },
  { label: 'UNIQUE', kind: 17, insertText: 'UNIQUE', detail: 'Constraint' },
  { label: 'CHECK', kind: 17, insertText: 'CHECK (${1:condition})', detail: 'Constraint' },
  { label: 'DEFAULT', kind: 17, insertText: 'DEFAULT ${1:value}', detail: 'Constraint' },
  // Functions
  { label: 'COUNT', kind: 2 /* Function */, insertText: 'COUNT(${1:column_or_*})', detail: 'Function', documentation: 'Counts rows or non-NULL column values.' },
  { label: 'SUM', kind: 2, insertText: 'SUM(${1:column})', detail: 'Function', documentation: 'Calculates the sum of values.' },
  { label: 'AVG', kind: 2, insertText: 'AVG(${1:column})', detail: 'Function', documentation: 'Calculates the average of values.' },
  { label: 'MIN', kind: 2, insertText: 'MIN(${1:column})', detail: 'Function', documentation: 'Finds the minimum value.' },
  { label: 'MAX', kind: 2, insertText: 'MAX(${1:column})', detail: 'Function', documentation: 'Finds the maximum value.' },
  // SQLite specific
  { label: 'PRAGMA', kind: 17, insertText: 'PRAGMA ${1:name};', detail: 'SQLite Command' },
  { label: 'AUTOINCREMENT', kind: 17, insertText: 'AUTOINCREMENT', detail: 'SQLite Keyword' },
  { label: 'ATTACH', kind: 17, insertText: "ATTACH DATABASE '${1:filename}' AS ${2:schema_name};", detail: 'SQLite Command'},
  { label: 'DETACH', kind: 17, insertText: "DETACH DATABASE ${1:schema_name};", detail: 'SQLite Command'},
  { label: 'REINDEX', kind: 17, insertText: 'REINDEX ${1:collation_name_or_table_or_index};', detail: 'SQLite Command'},
  { label: 'VACUUM', kind: 17, insertText: 'VACUUM;', detail: 'SQLite Command'},
  // Transaction Control
  { label: 'BEGIN', kind: 17, insertText: 'BEGIN TRANSACTION;', detail: 'Transaction Control' },
  { label: 'COMMIT', kind: 17, insertText: 'COMMIT;', detail: 'Transaction Control' },
  { label: 'ROLLBACK', kind: 17, insertText: 'ROLLBACK;', detail: 'Transaction Control' },
  { label: 'SAVEPOINT', kind: 17, insertText: 'SAVEPOINT ${1:name};', detail: 'Transaction Control' },
  { label: 'RELEASE', kind: 17, insertText: 'RELEASE SAVEPOINT ${1:name};', detail: 'Transaction Control' },
  // Other keywords from provided list
  { label: 'ABORT', kind: 17, insertText: 'ABORT', detail: 'Keyword' },
  { label: 'ACTION', kind: 17, insertText: 'ACTION', detail: 'Keyword' },
  { label: 'ADD', kind: 17, insertText: 'ADD', detail: 'Keyword' },
  { label: 'AFTER', kind: 17, insertText: 'AFTER', detail: 'Keyword' },
  { label: 'ALL', kind: 17, insertText: 'ALL', detail: 'Keyword' },
  { label: 'ALTER', kind: 17, insertText: 'ALTER', detail: 'Keyword' },
  { label: 'ANALYZE', kind: 17, insertText: 'ANALYZE', detail: 'Keyword' },
  { label: 'ASC', kind: 17, insertText: 'ASC', detail: 'Keyword' },
  { label: 'BEFORE', kind: 17, insertText: 'BEFORE', detail: 'Keyword' },
  { label: 'BY', kind: 17, insertText: 'BY', detail: 'Keyword' },
  { label: 'CASCADE', kind: 17, insertText: 'CASCADE', detail: 'Keyword' },
  { label: 'CASE', kind: 17, insertText: 'CASE WHEN ${1:condition} THEN ${2:result} ELSE ${3:result} END', detail: 'Expression' },
  { label: 'CAST', kind: 2, insertText: 'CAST(${1:expression} AS ${2:datatype})', detail: 'Function' },
  { label: 'COLLATE', kind: 17, insertText: 'COLLATE', detail: 'Keyword' },
  { label: 'COLUMN', kind: 17, insertText: 'COLUMN', detail: 'Keyword' },
  { label: 'CONFLICT', kind: 17, insertText: 'ON CONFLICT', detail: 'Clause' },
  { label: 'CONSTRAINT', kind: 17, insertText: 'CONSTRAINT', detail: 'Keyword' },
  { label: 'CREATE', kind: 17, insertText: 'CREATE', detail: 'Keyword' },
  { label: 'CROSS', kind: 17, insertText: 'CROSS JOIN', detail: 'Join Type' },
  { label: 'CURRENT_DATE', kind: 6 /* Value */, insertText: 'CURRENT_DATE', detail: 'Value', documentation: 'Returns the current date.' },
  { label: 'CURRENT_TIME', kind: 6, insertText: 'CURRENT_TIME', detail: 'Value', documentation: 'Returns the current time.' },
  { label: 'CURRENT_TIMESTAMP', kind: 6, insertText: 'CURRENT_TIMESTAMP', detail: 'Value', documentation: 'Returns the current date and time.' },
  { label: 'DATABASE', kind: 17, insertText: 'DATABASE', detail: 'Keyword' },
  { label: 'DEFERRABLE', kind: 17, insertText: 'DEFERRABLE', detail: 'Keyword' },
  { label: 'DEFERRED', kind: 17, insertText: 'DEFERRED', detail: 'Keyword' },
  { label: 'DESC', kind: 17, insertText: 'DESC', detail: 'Keyword' },
  { label: 'DROP', kind: 17, insertText: 'DROP', detail: 'Keyword' },
  { label: 'EACH', kind: 17, insertText: 'EACH', detail: 'Keyword' },
  { label: 'ELSE', kind: 17, insertText: 'ELSE ', detail: 'Clause' },
  { label: 'END', kind: 17, insertText: 'END', detail: 'Keyword' },
  { label: 'ESCAPE', kind: 17, insertText: "ESCAPE '${1:char}'", detail: 'Clause' },
  { label: 'EXCEPT', kind: 17, insertText: 'EXCEPT', detail: 'Operator' },
  { label: 'EXCLUSIVE', kind: 17, insertText: 'EXCLUSIVE', detail: 'Keyword' },
  { label: 'EXPLAIN', kind: 17, insertText: 'EXPLAIN QUERY PLAN ', detail: 'Command' },
  { label: 'FAIL', kind: 17, insertText: 'FAIL', detail: 'Conflict Resolution' },
  { label: 'FOR', kind: 17, insertText: 'FOR', detail: 'Keyword' },
  { label: 'FOREIGN', kind: 17, insertText: 'FOREIGN', detail: 'Keyword' },
  { label: 'FULL', kind: 17, insertText: 'FULL', detail: 'Keyword' },
  { label: 'GLOB', kind: 13, insertText: "GLOB '${1:pattern}'", detail: 'Operator' },
  { label: 'GROUP', kind: 17, insertText: 'GROUP', detail: 'Keyword' },
  { label: 'IF', kind: 17, insertText: 'IF EXISTS ', detail: 'Clause' },
  { label: 'IGNORE', kind: 17, insertText: 'IGNORE', detail: 'Conflict Resolution' },
  { label: 'IMMEDIATE', kind: 17, insertText: 'IMMEDIATE', detail: 'Keyword' },
  { label: 'INDEX', kind: 17, insertText: 'INDEX', detail: 'Keyword' },
  { label: 'INDEXED', kind: 17, insertText: 'INDEXED BY ${1:index_name}', detail: 'Clause' },
  { label: 'INITIALLY', kind: 17, insertText: 'INITIALLY', detail: 'Keyword' },
  { label: 'INNER', kind: 17, insertText: 'INNER', detail: 'Keyword' },
  { label: 'INSERT', kind: 17, insertText: 'INSERT', detail: 'Keyword' },
  { label: 'INSTEAD', kind: 17, insertText: 'INSTEAD OF', detail: 'Clause' },
  { label: 'INTERSECT', kind: 17, insertText: 'INTERSECT', detail: 'Operator' },
  { label: 'INTO', kind: 17, insertText: 'INTO', detail: 'Keyword' },
  { label: 'IS', kind: 17, insertText: 'IS ', detail: 'Operator' },
  { label: 'ISNULL', kind: 2, insertText: 'ISNULL(${1:expression})', detail: 'Function' },
  { label: 'KEY', kind: 17, insertText: 'KEY', detail: 'Keyword' },
  { label: 'LEFT', kind: 17, insertText: 'LEFT', detail: 'Keyword' },
  { label: 'MATCH', kind: 13, insertText: "MATCH '${1:pattern}'", detail: 'Operator' },
  { label: 'NATURAL', kind: 17, insertText: 'NATURAL ', detail: 'Join Type' },
  { label: 'NO', kind: 17, insertText: 'NO', detail: 'Keyword' },
  { label: 'NOTNULL', kind: 2, insertText: 'NOTNULL(${1:expression})', detail: 'Function' },
  { label: 'NULL', kind: 6, insertText: 'NULL', detail: 'Value' },
  { label: 'OF', kind: 17, insertText: 'OF', detail: 'Keyword' },
  { label: 'ON', kind: 17, insertText: 'ON ', detail: 'Keyword' },
  { label: 'OUTER', kind: 17, insertText: 'OUTER', detail: 'Keyword' },
  { label: 'PLAN', kind: 17, insertText: 'PLAN', detail: 'Keyword' },
  { label: 'PRIMARY', kind: 17, insertText: 'PRIMARY', detail: 'Keyword' },
  { label: 'QUERY', kind: 17, insertText: 'QUERY', detail: 'Keyword' },
  { label: 'RAISE', kind: 17, insertText: 'RAISE(${1:ABORT|FAIL|IGNORE}, \'${2:error_message}\')', detail: 'Statement' },
  { label: 'RECURSIVE', kind: 17, insertText: 'RECURSIVE', detail: 'Keyword' },
  { label: 'REFERENCES', kind: 17, insertText: 'REFERENCES ${1:table}(${2:column})', detail: 'Clause' },
  { label: 'REGEXP', kind: 13, insertText: "REGEXP '${1:pattern}'", detail: 'Operator' },
  { label: 'RELEASE', kind: 17, insertText: 'RELEASE', detail: 'Keyword' },
  { label: 'RENAME', kind: 17, insertText: 'RENAME TO', detail: 'Clause' },
  { label: 'REPLACE', kind: 17, insertText: 'REPLACE INTO ${1:table_name} ...', detail: 'Statement', documentation: 'Similar to INSERT, but replaces row if key exists.' },
  { label: 'RESTRICT', kind: 17, insertText: 'RESTRICT', detail: 'Keyword' },
  { label: 'RIGHT', kind: 17, insertText: 'RIGHT', detail: 'Keyword' },
  { label: 'ROLLBACK', kind: 17, insertText: 'ROLLBACK', detail: 'Keyword' },
  { label: 'ROW', kind: 17, insertText: 'ROW', detail: 'Keyword' },
  { label: 'SAVEPOINT', kind: 17, insertText: 'SAVEPOINT', detail: 'Keyword' },
  { label: 'TABLE', kind: 17, insertText: 'TABLE', detail: 'Keyword' },
  { label: 'TEMP', kind: 17, insertText: 'TEMP', detail: 'Keyword' },
  { label: 'TEMPORARY', kind: 17, insertText: 'TEMPORARY', detail: 'Keyword' },
  { label: 'THEN', kind: 17, insertText: 'THEN ', detail: 'Clause' },
  { label: 'TO', kind: 17, insertText: 'TO', detail: 'Keyword' },
  { label: 'TRANSACTION', kind: 17, insertText: 'TRANSACTION', detail: 'Keyword' },
  { label: 'TRIGGER', kind: 17, insertText: 'TRIGGER', detail: 'Keyword' },
  { label: 'UNION', kind: 17, insertText: 'UNION', detail: 'Operator' },
  { label: 'UNIQUE', kind: 17, insertText: 'UNIQUE', detail: 'Keyword' },
  { label: 'USING', kind: 17, insertText: 'USING ()', detail: 'Clause' },
  { label: 'VIEW', kind: 17, insertText: 'VIEW', detail: 'Keyword' },
  { label: 'VIRTUAL', kind: 17, insertText: 'VIRTUAL', detail: 'Keyword' },
  { label: 'WHEN', kind: 17, insertText: 'WHEN ', detail: 'Clause' },
  { label: 'WITH', kind: 17, insertText: 'WITH ${1:cte_name} AS (\n  ${2:SELECT ...}\n) SELECT ...;', detail: 'Clause', documentation: 'Common Table Expression.' },
  { label: 'WITHOUT', kind: 17, insertText: 'WITHOUT ROWID', detail: 'Clause' },
];

const DEFAULT_TABLE_SCHEMA_FOR_SUGGEST = `/* Provide table schemas for more accurate SQL generation. Example:
Customers (CustomerID TEXT PRIMARY KEY, CustomerName TEXT, City TEXT)
Orders (OrderID INTEGER PRIMARY KEY, CustomerID TEXT, OrderDate DATETIME)
Products (ProductID INTEGER PRIMARY KEY, ProductName TEXT, UnitPrice REAL)
*/`;

const RISKY_KEYWORDS = [
  'DROP', 'DELETE', 'UPDATE', 'INSERT', 'REPLACE',
  'ALTER', 'VACUUM', 'ROLLBACK', 'BEGIN', 'COMMIT', 'PRAGMA'
];

const createInitialSampleTab = (): QueryTab => ({
  id: String(Date.now()), // Initial ID, can be simple
  firestoreId: null,
  name: "Sample Query",
  sql: `-- Welcome to SQL Artisan Pro!
-- Try executing some queries against the sample database. For example:
-- SELECT * FROM Customers WHERE Country = 'Mexico';
--
-- Or, create a new table:
-- CREATE TABLE Employees (
--   EmployeeID INTEGER PRIMARY KEY,
--   FirstName TEXT,
--   LastName TEXT,
--   HireDate DATE
-- );
--
-- Use the buttons below to Execute, Save, Analyze, or Translate your SQL.
-- Upload SQL, CSV, or JSON files via the 'Uploads' page to add more tables.`,
  queryResults: null,
  aiResponse: null,
  isExecutingQuery: false,
  isLoadingAi: false,
  aiError: null,
});


export default function EditorPage() {
  const { toast } = useToast();
  const { setLastExecutedQuery } = useLastExecutedQuery();
  const editorRef = React.useRef<any>(null);
  const renameInputRef = React.useRef<HTMLInputElement>(null);

  const [tabs, setTabs] = React.useState<QueryTab[]>([createInitialSampleTab()]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(tabs[0]?.id || null);
  
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = React.useState(false);
  const [resultsViewMode, setResultsViewMode] = React.useState<'table' | 'json'>('table');

  const finalizedTranscriptRef = React.useRef<string>('');
  const currentInterimTranscriptRef = React.useRef<string>('');

  React.useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechRecognitionSupported(true);
    }
  }, []);


  const [isTranslateDialogOpen, setIsTranslateDialogOpen] = React.useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = React.useState('');
  const [isTranslatingSql, setIsTranslatingSql] = React.useState(false);
  const [translateDialogError, setTranslateDialogError] = React.useState<string | null>(null);

  const [isRecording, setIsRecording] = React.useState(false);
  const speechRecognitionRef = React.useRef<SpeechRecognition | null>(null);


  const [renamingTabId, setRenamingTabId] = React.useState<string | null>(null);
  const [editingTabName, setEditingTabName] = React.useState('');
  const [isSavingQuery, setIsSavingQuery] = React.useState(false);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [queryToConfirm, setQueryToConfirm] = React.useState<string | null>(null);
  const [identifiedRiskyKeywords, setIdentifiedRiskyKeywords] = React.useState<string[]>([]);

  const activeQueryTab = React.useMemo(() => tabs.find(tab => tab.id === activeTabId), [tabs, activeTabId]);

  const updateActiveTabProperty = React.useCallback(<K extends keyof QueryTab>(property: K, value: QueryTab[K]) => {
    if (activeTabId) {
      setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === activeTabId ? { ...tab, [property]: value } : tab
        )
      );
    }
  }, [activeTabId, setTabs]);

  React.useEffect(() => {
    if (renamingTabId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingTabId]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    const uniqueCompletionItems = Array.from(
      new Map(SQL_COMPLETION_ITEMS.map(item => [item.label.toUpperCase(), item])).values()
    );

    const completionProvider = monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = uniqueCompletionItems.map(item => ({
          label: item.label,
          kind: item.kind as monaco.languages.CompletionItemKind,
          insertText: item.insertText,
          insertTextRules: item.insertText && item.insertText.includes('${')
            ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            : monaco.languages.CompletionItemInsertTextRule.KeepWhitespace,
          detail: item.detail,
          documentation: item.documentation ? { value: item.documentation, isTrusted: true } : undefined,
          range: range,
        }));
        return { suggestions: suggestions };
      },
    });
    return () => {
      completionProvider.dispose();
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.onstart = null;
      }
    };
  };

  const createNewTab = React.useCallback((): QueryTab => {
    const untitledRegex = /^Untitled Query (\d+)$/;
    let maxNum = 0;
    tabs.forEach(tab => {
      const match = tab.name.match(untitledRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });
    const newQueryNumber = maxNum + 1;
    const newName = `Untitled Query ${newQueryNumber}`;
    
    return {
      id: String(Date.now() + Math.random()), 
      firestoreId: null,
      name: newName,
      sql: '',
      queryResults: null,
      aiResponse: null,
      isExecutingQuery: false,
      isLoadingAi: false,
      aiError: null,
    };
  }, [tabs]);


  const handleAddTab = () => {
    const newTab = createNewTab();
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabIdToClose: string, event?: React.MouseEvent<HTMLDivElement | HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>) => {
    event?.stopPropagation(); 
    setTabs(prevTabs => {
      const remainingTabs = prevTabs.filter(tab => tab.id !== tabIdToClose);
      if (remainingTabs.length === 0) {
        const newDefaultTab = createInitialSampleTab();
        setActiveTabId(newDefaultTab.id);
        return [newDefaultTab];
      }
      if (activeTabId === tabIdToClose) {
        const closedTabIndex = prevTabs.findIndex(tab => tab.id === tabIdToClose);
        const newActiveIndex = Math.max(0, closedTabIndex - 1);
        setActiveTabId(remainingTabs[newActiveIndex]?.id || remainingTabs[0]?.id || null);
      }
      return remainingTabs;
    });
  };

  const handleRenameTabStart = (tab: QueryTab) => {
    setRenamingTabId(tab.id);
    setEditingTabName(tab.name);
  };

  const handleRenameTabConfirm = () => {
    if (!renamingTabId || !editingTabName.trim()) {
      setRenamingTabId(null);
      if (!editingTabName.trim() && renamingTabId) {
         toast({ title: "Rename Cancelled", description: "Tab name cannot be empty.", variant: "destructive" });
      }
      return;
    }
    setTabs(prevTabs =>
        prevTabs.map(tab =>
          tab.id === renamingTabId ? { ...tab, name: editingTabName.trim() } : tab
        )
    );
    setRenamingTabId(null);
    toast({ title: "Tab Renamed", description: `Tab renamed to "${editingTabName.trim()}".` });
  };

  const handleRenameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleRenameTabConfirm();
    } else if (event.key === 'Escape') {
      setRenamingTabId(null);
      toast({ title: "Rename Cancelled" });
    }
  };

  const getRiskyKeywordsInQuery = (sql: string): string[] => {
    if (!sql) return [];
    const foundKeywords: string[] = [];
    const upperSql = sql.toUpperCase();
    RISKY_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toUpperCase()}\\b`, 'g');
      if (regex.test(upperSql)) {
        foundKeywords.push(keyword);
      }
    });
    return foundKeywords;
  };

  const _executeConfirmedQuery = async (sqlToExecute: string) => {
    if (!activeQueryTab) return;
    updateActiveTabProperty('isExecutingQuery', true);
    updateActiveTabProperty('queryResults', null);
    updateActiveTabProperty('aiResponse', null);
    updateActiveTabProperty('aiError', null);
    setResultsViewMode('table');

    let resultData: ApiQueryResultType | null = null;

    try {
      const response = await fetch('/api/db/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sqlQuery: sqlToExecute }),
      });

      resultData = await response.json();

      if (!response.ok) {
        const serverError = resultData?.error || resultData?.message || `HTTP error! status: ${response.status}`;
        updateActiveTabProperty('queryResults', { columns: [], rows: [], error: serverError, message: serverError, messages: resultData?.messages || [serverError]});
        toast({ title: "Query Execution Failed", description: serverError, variant: "destructive" });
      } else {
        updateActiveTabProperty('queryResults', resultData);
        if (resultData?.messages && resultData.messages.length > 0) {
          const isErrorResponse = resultData.error || (resultData.messages.some(m => m.toLowerCase().includes("error")));
          toast({
              title: isErrorResponse ? "Query Execution Issue" : "Query Execution Summary",
              description: (
                <ScrollArea className="max-h-32">
                  <ul className="list-disc list-inside text-xs">
                      {resultData.messages.map((msg, i) => <li key={i}>{msg}</li>)}
                  </ul>
                </ScrollArea>
              ),
              variant: isErrorResponse ? "destructive" : "default",
              duration: resultData.messages.length > 1 ? 8000 : 5000,
          });
        } else if (resultData?.message) {
           toast({ title: "Query Executed", description: resultData.message});
        } else {
           toast({ title: "Query Executed", description: `Rows: ${resultData?.rowCount ?? 0}. Time: ${resultData?.executionTime || 'N/A'}.`});
        }
      }
    } catch (e: any) {
      const errorMessage = e.message || 'Failed to execute query. Network or unexpected error.';
      resultData = { columns: [], rows: [], error: errorMessage, message: errorMessage, messages: [errorMessage] };
      updateActiveTabProperty('queryResults', resultData);
      toast({ title: "Query Execution Failed", description: errorMessage, variant: "destructive" });
    } finally {
      updateActiveTabProperty('isExecutingQuery', false);
      if (activeQueryTab) {
         setLastExecutedQuery({
            sql: sqlToExecute,
            results: resultData, // This will be null if fetch failed before .json(), or contain error from API
            timestamp: new Date(),
        });
      }
    }
  };

  const handleExecuteQuery = async () => {
    if (!activeQueryTab || !activeQueryTab.sql.trim()) {
      toast({ title: "Input Required", description: "Active query tab is empty or contains only whitespace.", variant: "destructive" });
      return;
    }
    const riskyKws = getRiskyKeywordsInQuery(activeQueryTab.sql);
    if (riskyKws.length > 0) {
      setQueryToConfirm(activeQueryTab.sql);
      setIdentifiedRiskyKeywords(riskyKws);
      setIsConfirmDialogOpen(true);
    } else {
      _executeConfirmedQuery(activeQueryTab.sql);
    }
  };

  const handleAiAnalyze = async () => {
    if (!activeQueryTab || !activeQueryTab.sql.trim()) {
      toast({ title: "Input Required", description: "Active query tab is empty for AI analysis.", variant: "destructive" });
      return;
    }
    updateActiveTabProperty('isLoadingAi', true);
    updateActiveTabProperty('aiError', null);
    updateActiveTabProperty('aiResponse', null);

    try {
      const result = await optimizeSql({ sqlQuery: activeQueryTab.sql });
      updateActiveTabProperty('aiResponse', result);
      toast({ title: "AI Analysis Complete", description: "The AI has finished analyzing your query." });
    } catch (e: any) {
      const errorMessage = e.message || 'An unexpected error occurred with AI operation.';
      updateActiveTabProperty('aiError', errorMessage);
      toast({ title: "AI Analysis Error", description: errorMessage, variant: "destructive" });
    } finally {
      updateActiveTabProperty('isLoadingAi', false);
    }
  };

  const handleSaveActiveTab = React.useCallback(async () => {
    if (!activeQueryTab) {
      toast({ title: "No Active Tab", description: "Please select a tab to save.", variant: "destructive" });
      return;
    }
    setIsSavingQuery(true);
    try {
      const response = await fetch('/api/editor/save-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId: activeQueryTab.firestoreId,
          name: activeQueryTab.name,
          sql: activeQueryTab.sql,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save query');
      }
      const result = await response.json();
      
      updateActiveTabProperty('firestoreId', result.firestoreId);

      toast({
        title: "Query saved",
        description: `"${activeQueryTab.name}" has been saved successfully.`,
        variant: "default",
      });
    } catch (err: any) {
      console.error('Failed to save query:', err);
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSavingQuery(false);
    }
  }, [activeQueryTab, toast, updateActiveTabProperty]);


  const handleCopyQuery = () => {
    if (!activeQueryTab || !activeQueryTab.sql.trim()) {
      toast({ title: "Nothing to Copy", description: "Editor for active tab is empty.", variant: "default" });
      return;
    }
    navigator.clipboard.writeText(activeQueryTab.sql)
      .then(() => toast({ title: "Query Copied", description: "SQL query copied to clipboard." }))
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy query.", variant: "destructive" });
        console.error('Failed to copy: ', err);
      });
  };

  const handleClearQuery = () => {
    if (!activeQueryTab) return;
    updateActiveTabProperty('sql', '');
    updateActiveTabProperty('queryResults', null);
    updateActiveTabProperty('aiResponse', null);
    updateActiveTabProperty('aiError', null);
    if (editorRef.current) {
        editorRef.current.setValue('');
    }
    toast({ title: "Editor Cleared", description: `Content for tab "${activeQueryTab.name}" cleared.` });
  };
  
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleExportQuery = () => {
     if (!activeQueryTab || !activeQueryTab.sql.trim()) {
        toast({ title: "Nothing to Export", description: "Editor content is empty." });
        return;
    }
    const filenameBase = activeQueryTab.name.replace(/[^a-z0-9_.-]/gi, '_').replace(/_{2,}/g, '_');
    const filename = `${filenameBase || 'query'}.sql`;
    downloadFile(activeQueryTab.sql, filename, 'text/sql;charset=utf-8;');
    toast({ title: "Query Exported", description: `Query downloaded as ${filename}.` });
  };

  const handleToggleMic = () => {
    if (!speechRecognitionSupported) {
      toast({ title: "Speech Recognition Not Supported", description: "Your browser does not support this feature or permissions are not granted.", variant: "destructive" });
      return;
    }
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      return; 
    }
    
    if (naturalLanguageInput.trim()) {
        finalizedTranscriptRef.current = naturalLanguageInput.trim();
        if (finalizedTranscriptRef.current.length > 0 && !finalizedTranscriptRef.current.endsWith(' ')) {
            finalizedTranscriptRef.current += ' ';
        }
    } else {
      finalizedTranscriptRef.current = '';
    }
    currentInterimTranscriptRef.current = '';


    if (!speechRecognitionRef.current) {
      speechRecognitionRef.current = new SpeechRecognitionAPI();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let latestInterim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalizedTranscriptRef.current += transcriptSegment + ' '; 
            latestInterim = ""; 
          } else {
            latestInterim = transcriptSegment; 
          }
        }
        currentInterimTranscriptRef.current = latestInterim;
        setNaturalLanguageInput(finalizedTranscriptRef.current + currentInterimTranscriptRef.current);
      };

      speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        let errorMsg = "Speech recognition error. Please try again.";
        if (event.error === 'no-speech') errorMsg = "No speech detected. Please try speaking again.";
        else if (event.error === 'audio-capture') errorMsg = "Microphone not found or not working.";
        else if (event.error === 'not-allowed') errorMsg = "Microphone access denied by user or browser.";
        
        setTranslateDialogError(errorMsg);
        toast({ title: "Speech Error", description: errorMsg, variant: "destructive" });
        setIsRecording(false); 
      };

      speechRecognitionRef.current.onend = () => {
        setIsRecording(false);
        if (currentInterimTranscriptRef.current.trim()) {
          finalizedTranscriptRef.current += currentInterimTranscriptRef.current.trim() + ' ';
          currentInterimTranscriptRef.current = '';
          setNaturalLanguageInput(finalizedTranscriptRef.current);
        }
        toast({ title: "Listening stopped." });
      };

       speechRecognitionRef.current.onstart = () => {
        setIsRecording(true);
        toast({ title: "Listening...", description: "Please speak now."});
      };
    }

    try {
      speechRecognitionRef.current?.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      setIsRecording(false);
      toast({ title: "Mic Error", description: "Could not start microphone.", variant: "destructive"});
    }
  };

  const handleOpenTranslateDialog = () => {
    if (activeQueryTab?.sql.startsWith('/* NL:')) {
        const endCommentIndex = activeQueryTab.sql.indexOf('*/');
        if (endCommentIndex > '/* NL:'.length) {
            setNaturalLanguageInput(activeQueryTab.sql.substring('/* NL:'.length, endCommentIndex).trim());
        } else {
            setNaturalLanguageInput('');
        }
    } else {
        setNaturalLanguageInput('');
    }
    finalizedTranscriptRef.current = naturalLanguageInput.trim() + (naturalLanguageInput.trim().length > 0 ? ' ' : '');
    currentInterimTranscriptRef.current = '';
    setTranslateDialogError(null);
    setIsTranslateDialogOpen(true);
};


  const handlePerformTranslation = async () => {
    if (!activeQueryTab || !naturalLanguageInput.trim()) {
      setTranslateDialogError("Please enter a description for the query.");
      return;
    }
    setIsTranslatingSql(true);
    setTranslateDialogError(null);
    try {
      const result = await suggestSql({ description: naturalLanguageInput, tableSchema: DEFAULT_TABLE_SCHEMA_FOR_SUGGEST });
      const newSql = `/* NL: ${naturalLanguageInput.replace(/\*\//g, '* /')} */\n${result.sqlQuery}`; 
      updateActiveTabProperty('sql', newSql);
      if (editorRef.current) {
        editorRef.current.setValue(newSql);
      }
      setIsTranslateDialogOpen(false);
      setNaturalLanguageInput(''); 
      finalizedTranscriptRef.current = '';
      currentInterimTranscriptRef.current = '';
      toast({ title: "Translation Successful", description: "SQL query generated in active tab." });
    } catch (e: any) {
      const errorMessage = e.message || "Error during translation.";
      setTranslateDialogError(errorMessage);
      toast({ title: "Translation Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsTranslatingSql(false);
    }
  };
  
  const currentResults = activeQueryTab?.queryResults;
  const hasResultsForDisplay = currentResults && !currentResults.error && currentResults.rows && currentResults.rows.length > 0;
  const hasAnyResultData = currentResults && !currentResults.error && ( (currentResults.rows && currentResults.rows.length > 0) || (currentResults.columns && currentResults.columns.length > 0) || (currentResults.messages && currentResults.messages.length > 0 && (currentResults.changes !== undefined || currentResults.lastInsertRowid !== undefined )) );


  const handleExportCsv = () => {
    if (!activeQueryTab || !currentResults || !currentResults.rows || currentResults.rows.length === 0 || !currentResults.columns) {
      toast({ title: "No Data", description: "No data available to export as CSV.", variant: "default" });
      return;
    }
    const csvContent = convertToCSV(currentResults.columns, currentResults.rows);
    const filename = `${activeQueryTab.name.replace(/[^a-z0-9_.-]/gi, '_')}_results.csv`;
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    toast({ title: "CSV Exported", description: `Results downloaded as ${filename}.` });
  };

  const handleExportJson = () => {
    if (!activeQueryTab || !currentResults || (!currentResults.rows && !currentResults.columns) ) {
        toast({ title: "No Data", description: "No data available to export as JSON.", variant: "default" });
        return;
    }
    const jsonData = JSON.stringify({ columns: currentResults.columns || [], rows: currentResults.rows || [] }, null, 2);
    const filename = `${activeQueryTab.name.replace(/[^a-z0-9_.-]/gi, '_')}_results.json`;
    downloadFile(jsonData, filename, 'application/json;charset=utf-8;');
    toast({ title: "JSON Exported", description: `Results downloaded as ${filename}.` });
};

  const convertToCSV = (columns: string[], rows: any[][]): string => {
    const header = columns.map(col => `"${String(col ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
    const body = rows.map(row => 
      row.map(cell => {
        const stringCell = String(cell ?? ''); 
        if (stringCell.includes(',') || stringCell.includes('\n') || stringCell.includes('"')) {
          return `"${stringCell.replace(/"/g, '""')}"`;
        }
        return stringCell;
      }).join(',')
    ).join('\n');
    return header + body;
  };


  const renderQueryResultsDisplay = () => {
    if (!activeQueryTab) return null;
    if (activeQueryTab.isExecutingQuery) {
      return <div className="min-h-[150px] flex flex-col items-center justify-center text-center p-6"><Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" /><span className="text-muted-foreground mt-3 text-lg">Executing query...</span></div>;
    }
    const results = activeQueryTab.queryResults;
    if (!results) {
      return <div className="min-h-[150px] flex flex-col items-center justify-center text-center p-6"><DatabaseZap className="h-12 w-12 text-muted-foreground/40 mb-3" /><p className="text-lg font-medium text-muted-foreground mb-1">No Results to Display</p><p className="text-xs text-muted-foreground/80">Execute a query to see results here.</p></div>;
    }
    
    if (results.error) {
        return <Alert variant="destructive" className="m-4"><AlertTriangle className="h-5 w-5"/><AlertTitle>Query Error</AlertTitle><AlertDescription>{results.error}</AlertDescription>{results.messages && results.messages.length > 0 && results.messages.some(msg => msg !== results.error) && (<ScrollArea className="max-h-32"><ul className="mt-2 text-xs list-disc list-inside">{results.messages.map((msg, i) => <li key={i}>{msg}</li>)}</ul></ScrollArea>)}</Alert>;
    }
    
    if (results.messages && results.messages.length > 0 && (!results.rows || results.rows.length === 0) && (!results.columns || results.columns.length === 0)) {
        const isLikelyError = results.messages.some(m => m.toLowerCase().includes("error"));
        if (isLikelyError) {
            return <Alert variant="destructive" className="m-4"><AlertTriangle className="h-5 w-5"/><AlertTitle>Query Execution Issue</AlertTitle><ScrollArea className="max-h-40"><ul className="list-disc list-inside text-sm">{results.messages.map((msg, i) => <li key={i}>{msg}</li>)}</ul></ScrollArea></Alert>;
        }
        return <Alert variant="default" className="m-4 bg-green-500/10 border-green-500/30"><CheckCircle className="h-5 w-5 text-green-600"/><AlertTitle className="text-green-700">Execution Summary</AlertTitle><ScrollArea className="max-h-40"><ul className="list-disc list-inside text-sm text-green-600">{results.messages.map((msg, i) => <li key={i}>{msg}</li>)}</ul></ScrollArea>{results.changes !== undefined && <p className="text-xs text-green-500 mt-1">Total rows affected: {String(results.changes)}</p>}{results.lastInsertRowid !== undefined && Number(results.lastInsertRowid) > 0 && <p className="text-xs text-green-500 mt-1">Last inserted row ID: {String(results.lastInsertRowid)}</p>}</Alert>;
    }


    if (resultsViewMode === 'json') {
        if (!results.rows && !results.columns) {
             return <div className="min-h-[150px] flex flex-col items-center justify-center text-center p-6"><FileJson className="h-12 w-12 text-muted-foreground/40 mb-3" /><p className="text-lg font-medium text-muted-foreground mb-1">No Data for JSON View</p><p className="text-xs text-muted-foreground/80">Query might not have returned rows/columns or was not a SELECT.</p></div>;
        }
        return (
            <ScrollArea className="h-auto p-4"> {/* Added p-4 for padding around pre */}
                <pre className="whitespace-pre-wrap text-xs font-mono bg-muted/50 p-3 rounded-md border">
                    {JSON.stringify({ columns: results.columns || [], rows: results.rows || [] }, null, 2)}
                </pre>
            </ScrollArea>
        );
    }

    if (results.rows && results.rows.length > 0) {
      return <>
          <div className="text-xs text-muted-foreground flex justify-between px-4 pt-2 pb-1 border-b"><span data-testid="query-results-row-count">Rows: {results.rowCount ?? 'N/A'}</span><span>Execution Time: {results.executionTime ?? 'N/A'}</span></div>
          <ScrollArea className="h-auto"> {/* Unified max-h for table view */}
            <Table className="min-w-full"><TableHeader className="sticky top-0 bg-card z-10 shadow-sm"><TableRow>{results.columns.map(col => <TableHead key={col} className="font-semibold px-3 py-2.5">{col}</TableHead>)}</TableRow></TableHeader><TableBody>{results.rows.map((row, rowIndex) => <TableRow key={rowIndex} className="hover:bg-muted/50 transition-colors">{row.map((cell, cellIndex) => <TableCell key={cellIndex} className="text-sm px-3 py-2">{cell === null ? <span className="italic text-muted-foreground/70">NULL</span> : String(cell)}</TableCell>)}</TableRow>)}</TableBody></Table>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </>;
    }
     if (results.columns && results.columns.length > 0 && (!results.rows || results.rows.length === 0)) {
      return <>
          <div className="text-xs text-muted-foreground flex justify-between px-4 pt-2 pb-1 border-b"><span>Rows: 0</span><span>Execution Time: {results.executionTime ?? 'N/A'}</span></div>
          <ScrollArea className="h-auto max-h-[280px]">
            <Table className="min-w-full"><TableHeader className="sticky top-0 bg-card z-10 shadow-sm"><TableRow>{results.columns.map(col => <TableHead key={col} className="font-semibold px-3 py-2.5">{col}</TableHead>)}</TableRow></TableHeader><TableBody><TableRow><TableCell colSpan={results.columns.length} className="text-center text-muted-foreground py-10">Query executed successfully, but no rows returned.</TableCell></TableRow></TableBody></Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>;
    }
    return <div className="min-h-[150px] flex flex-col items-center justify-center text-center p-6"><DatabaseZap className="h-12 w-12 text-muted-foreground/40 mb-3" /><p className="text-lg font-medium text-muted-foreground mb-1">Query Executed</p><p className="text-xs text-muted-foreground/80">The query may not have returned data. Check execution summary messages above if any.</p></div>;
  };


  const renderAiOutputDisplay = () => {
    if (!activeQueryTab) return null;
    if (activeQueryTab.isLoadingAi) {
      return <div className="flex flex-col items-center justify-center h-full min-h-[180px]"><Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" /><span className="text-muted-foreground mt-3 text-lg">AI is processing...</span></div>;
    }
    if (activeQueryTab.aiError) {
      return <Alert variant="destructive" className="m-4"><AlertTriangle className="h-5 w-5" /><AlertTitle>AI Operation Error</AlertTitle><AlertDescription>{activeQueryTab.aiError}</AlertDescription></Alert>;
    }
    if (!activeQueryTab.aiResponse) {
      return <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center p-6"><Sparkles className="h-16 w-16 text-muted-foreground/40 mb-4" /><p className="text-xl font-medium text-muted-foreground mb-1">AI Analysis Results</p><p className="text-sm text-muted-foreground/80">Analyze your query to see AI insights here.</p></div>;
    }
    const optimizeRes = activeQueryTab.aiResponse;
    return (
      <div className="space-y-4 p-3">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-primary">Optimized Query:</h3>
           <ScrollArea className="h-auto"> {/* Adjusted max-h */}
            <pre className="whitespace-pre-wrap p-4 bg-muted/50 rounded-md text-sm font-mono shadow-inner border">
              {optimizeRes.optimizedQuery}
            </pre>
          </ScrollArea>
        </div>
        {optimizeRes.suggestions && optimizeRes.suggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Optimization Suggestions:</h3>
            <ScrollArea className="h-auto"> {/* Adjusted max-h */}
              <ul className="list-disc list-inside pl-4 space-y-2 text-sm bg-muted/30 p-4 rounded-md shadow-inner border">
                {optimizeRes.suggestions.map((s, i) => <li key={i} className="py-1 border-b border-border/50 last:border-b-0">{s}</li>)}
              </ul>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  };


  return (
    <>
      <div className="space-y-4 h-full flex flex-col">
         <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            SQL Editor Pro
            </span>
        </h1>

        <div className="flex items-center border-b border-border bg-muted/30 rounded-t-lg overflow-hidden">
          <ScrollArea className="flex-grow whitespace-nowrap" orientation="horizontal"> {/* Added orientation prop */}
            <div className="flex items-stretch h-full"> 
              {tabs.map(tab => (
                renamingTabId === tab.id ? (
                  <Input
                    key={`${tab.id}-input`}
                    ref={renameInputRef}
                    type="text"
                    value={editingTabName}
                    onChange={(e) => setEditingTabName(e.target.value)}
                    onBlur={handleRenameTabConfirm}
                    onKeyDown={handleRenameKeyDown}
                    className={cn(
                        "h-full w-auto min-w-[150px] max-w-[250px] rounded-none border-0 border-r border-b-2 focus:ring-0 px-3 py-2.5 text-sm focus:border-primary",
                        activeTabId === tab.id ? "border-b-primary shadow-inner bg-background" : "border-b-transparent bg-muted/80"
                    )}
                  />
                ) : (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  onDoubleClick={() => handleRenameTabStart(tab)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 border-r border-border text-sm font-medium focus:outline-none whitespace-nowrap h-full relative group", 
                    activeTabId === tab.id ? "bg-primary text-primary-foreground shadow-inner" : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  )}
                  title={`Double-click to rename. Current: ${tab.name}`}
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate max-w-[150px]">{tab.name}</span>
                   <div
                    role="button"
                    tabIndex={0}
                    className="h-5 w-5 p-0.5 ml-2 flex items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive group-hover:text-destructive transition-colors focus:ring-2 focus:ring-destructive/50 focus:outline-none" 
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleCloseTab(tab.id, e); } }}
                    aria-label="Close tab"
                  >
                    <X className="h-3.5 w-3.5" />
                  </div>
                </button>
                )
              ))}
               <Button
                variant="ghost"
                size="icon"
                className="p-2.5 border-l border-border rounded-none h-full hover:bg-primary/20 self-stretch" 
                onClick={handleAddTab}
                aria-label="Add new query tab"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        
        <Card className="shadow-xl border-primary/20 rounded-t-none flex-grow flex flex-col min-h-0"> 
          <CardContent className="p-0 flex-grow flex flex-col overflow-hidden">
            <div className="rounded-md border-input overflow-hidden flex-grow min-h-[250px] md:min-h-[300px] shadow-inner relative"> 
                <MonacoEditor
                  key={activeTabId} 
                  height="100%" 
                  language="sql"
                  theme="light"
                  value={activeQueryTab?.sql || ''}
                  onChange={(value) => activeQueryTab && updateActiveTabProperty('sql', value || '')}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: true, scale: 2, side: 'right' },
                    fontSize: 15, wordWrap: 'on', scrollBeyondLastLine: false,
                    automaticLayout: true, padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'all', scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                    lineNumbersMinChars: 3, glyphMargin: false, folding: true, showFoldingControls: 'mouseover', contextmenu: true,
                  }}
                />
            </div>
          </CardContent>
           <CardFooter className="flex w-full items-center justify-between gap-2 flex-wrap px-2 py-3 border-t bg-muted/30"> 
            <div className="flex gap-2 flex-wrap">
                <Button onClick={handleExecuteQuery} disabled={activeQueryTab?.isExecutingQuery || !activeQueryTab?.sql.trim()} variant="success">
                    {activeQueryTab?.isExecutingQuery ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-1 h-4 w-4" />} Execute
                </Button>
                <Button onClick={handleSaveActiveTab} variant="default" disabled={isSavingQuery || activeQueryTab?.isLoadingAi || activeQueryTab?.isExecutingQuery}>
                    {isSavingQuery ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} Save
                </Button>
                <Button onClick={handleAiAnalyze} variant="info" disabled={activeQueryTab?.isLoadingAi || activeQueryTab?.isExecutingQuery || !activeQueryTab?.sql.trim()}>
                    {activeQueryTab?.isLoadingAi ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <BarChartBig className="mr-1 h-4 w-4" />} Analyze
                </Button>
                <Button onClick={handleOpenTranslateDialog} variant="info" disabled={activeQueryTab?.isLoadingAi || activeQueryTab?.isExecutingQuery}><Languages className="mr-1 h-4 w-4" /> Translate</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
                <Button onClick={handleCopyQuery} variant="outline"><Copy className="mr-1 h-4 w-4" /> Copy</Button>
                <Button onClick={handleClearQuery} variant="outline"><Eraser className="mr-1 h-4 w-4" /> Clear</Button>
                <Button onClick={handleExportQuery} variant="outline"><Download className="mr-1 h-4 w-4" /> Export</Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="shadow-xl border-border/50 flex-shrink-0 mt-4"> 
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center"><DatabaseZap className="mr-2 h-5 w-5 text-primary"/> Query Results</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setResultsViewMode('table')} disabled={resultsViewMode === 'table' || !hasAnyResultData}><TableIcon className="mr-1.5 h-4 w-4" /> Table View</Button>
                    <Button variant="outline" size="sm" onClick={() => setResultsViewMode('json')} disabled={resultsViewMode === 'json' || !hasAnyResultData}><FileJson className="mr-1.5 h-4 w-4" /> Raw JSON</Button>
                    <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!hasResultsForDisplay}><Download className="mr-1.5 h-4 w-4" /> CSV</Button>
                    <Button variant="outline" size="sm" onClick={handleExportJson} disabled={!hasAnyResultData}><Download className="mr-1.5 h-4 w-4" /> JSON</Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 min-h-[100px] max-h-[400px] overflow-y-auto">
              {renderQueryResultsDisplay()}
            </CardContent>
        </Card>

        <Card className="shadow-xl border-border/50 flex-shrink-0 mt-4"> 
            <CardHeader className="py-3 px-4">
                <CardTitle className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary"/> AI Analysis Output</CardTitle>
            </CardHeader>
            <CardContent className="p-0 min-h-[150px] max-h-[400px] overflow-y-auto">
                {renderAiOutputDisplay()}
            </CardContent>
        </Card>
      </div>

      <Dialog open={isTranslateDialogOpen} onOpenChange={(open) => {
          setIsTranslateDialogOpen(open);
          if (!open && speechRecognitionRef.current && isRecording) { 
            speechRecognitionRef.current.stop();
          }
        }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl">Translate to SQL</DialogTitle><DialogDescription>Enter an English description of the query you want to create, or use the microphone.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="natural-language-input">English description</Label>
                <Textarea id="natural-language-input" placeholder="e.g., Show me all customers who made a purchase in the last month" rows={4} value={naturalLanguageInput} onChange={(e) => {
                    setNaturalLanguageInput(e.target.value);
                    if (!isRecording) { 
                        finalizedTranscriptRef.current = e.target.value;
                    }
                }} className="text-base" disabled={isTranslatingSql}/>
            </div>
            
            {speechRecognitionSupported ? (
              <Button variant="ghost" size="icon" onClick={handleToggleMic} disabled={isTranslatingSql} className={cn(isRecording && "bg-red-500/20 text-red-600 hover:bg-red-500/30 hover:text-red-700", "sm:inline-flex")}>
                  {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  <span className="sr-only">{isRecording ? "Stop Listening" : "Use Microphone"}</span>
              </Button>
            ) : (
                <p className="text-xs text-muted-foreground">Speech recognition not supported by your browser.</p>
            )}
            {translateDialogError && (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Translation Error</AlertTitle><AlertDescription>{translateDialogError}</AlertDescription></Alert>)}
          </div>
          <DialogFooter className="flex flex-row justify-between w-full sm:justify-between">
            <div className="flex gap-2">
                <DialogClose asChild><Button variant="outline" disabled={isTranslatingSql}>Cancel</Button></DialogClose>
                <Button onClick={handlePerformTranslation} disabled={isTranslatingSql || !naturalLanguageInput.trim() || isRecording} variant="success">
                    {isTranslatingSql ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : null}Translate
                </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><AlertTriangle className="text-destructive mr-2 h-6 w-6"/>Confirm Query Execution</AlertDialogTitle>
            <AlertDialogDescription>
              The query you are about to execute contains potentially risky keywords: <br />
              <strong className="text-destructive">{identifiedRiskyKeywords.join(', ')}</strong>.
              <br /><br />
              These operations can alter or delete data. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQueryToConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (queryToConfirm) {
                  _executeConfirmedQuery(queryToConfirm);
                }
                setQueryToConfirm(null);
              }}
              variant="destructive"
            >
              Yes, Execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
