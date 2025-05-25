
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Loader2, AlertTriangle, ChevronUp, ChevronDown, Send, Code, ShieldCheck, Zap, Copy } from "lucide-react";
import type { LucideIcon } from 'lucide-react';
import { explainSql, type ExplainSqlOutput } from '@/ai/flows/explain-sql';
import { optimizeSql, type OptimizeSqlOutput } from '@/ai/flows/optimize-sql';
import { suggestSql, type SuggestSqlOutput } from '@/ai/flows/suggest-sql';
import { marked } from 'marked';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_TABLE_SCHEMA = `/* No schema explicitly provided. 
For more specific SQL, include your table schema using 'SCHEMA: CREATE TABLE ...;' in your '/suggest' request. 
Example: /suggest get all active users SCHEMA: CREATE TABLE Users (UserID INT, UserName VARCHAR, IsActive BOOLEAN); 
Common tables like Customers(CustomerID, Name), Orders(OrderID, CustomerID, OrderDate), Products(ProductID, Name, Price) might be assumed. */`;

type AiResponseType = ExplainSqlOutput | OptimizeSqlOutput | SuggestSqlOutput;

interface Suggestion {
  id: string;
  icon: LucideIcon;
  text: string;
  subtext: string;
  command: string;
}

const allPossibleSuggestions: Suggestion[] = [
  { id: 's1', icon: Code, text: 'Explain an SQL query', subtext: 'Understand what a complex query does.', command: '/explain SELECT c.CustomerName, COUNT(o.OrderID) AS TotalOrders FROM Customers c JOIN Orders o ON c.CustomerID = o.CustomerID GROUP BY c.CustomerName HAVING COUNT(o.OrderID) > 5 ORDER BY TotalOrders DESC;' },
  { id: 's2', icon: Zap, text: 'Optimize SQL performance', subtext: 'Get suggestions to make your query faster.', command: '/optimize SELECT * FROM Products WHERE CategoryID IN (SELECT CategoryID FROM Categories WHERE CategoryName LIKE \'%Dairy%\') AND UnitPrice > (SELECT AVG(UnitPrice) FROM Products);' },
  { id: 's3', icon: Sparkles, text: 'Generate SQL from description', subtext: 'Convert natural language to an SQL query.', command: '/suggest Find all customers from London who placed an order in the last month SCHEMA: CREATE TABLE Customers (CustomerID TEXT, City TEXT); CREATE TABLE Orders (OrderID INT, CustomerID TEXT, OrderDate DATETIME);' },
  { id: 's4', icon: Code, text: 'List all tables', subtext: 'Get a list of all tables in the database.', command: "SELECT name FROM sqlite_master WHERE type='table';" },
  { id: 's5', icon: Zap, text: 'Optimize a simple join', subtext: 'Improve a basic customer and order join.', command: '/optimize SELECT Customers.CustomerName, Orders.OrderID FROM Customers INNER JOIN Orders ON Customers.CustomerID = Orders.CustomerID WHERE Customers.Country = \'Germany\';' },
  { id: 's6', icon: Sparkles, text: 'Top 5 most expensive products', subtext: 'Generate SQL for this common request.', command: '/suggest Show the top 5 most expensive products SCHEMA: CREATE TABLE Products (ProductName TEXT, UnitPrice REAL);' },
  { id: 's7', icon: Code, text: 'Show product categories', subtext: 'View distinct product categories.', command: 'SELECT DISTINCT CategoryName FROM Categories;' },
  { id: 's8', icon: Sparkles, text: 'Count orders per customer', subtext: 'SQL to count how many orders each customer has.', command: '/suggest Count total orders for each customer SCHEMA: CREATE TABLE Orders (CustomerID TEXT, OrderID INT); CREATE TABLE Customers (CustomerID TEXT, CustomerName TEXT);' },
  { id: 's9', icon: Zap, text: 'Analyze query with subquery', subtext: 'Get optimization tips for a query using a subselect.', command: '/optimize SELECT ProductName FROM Products WHERE UnitPrice > (SELECT AVG(UnitPrice) FROM Products);' },
  { id: 's10', icon: Code, text: 'Explain creating an index', subtext: 'Understand the SQL for adding an index.', command: '/explain CREATE INDEX idx_product_name ON Products (ProductName);' },
  { id: 's11', icon: Sparkles, text: 'Customers not in USA', subtext: 'Generate SQL for customers outside a specific country.', command: '/suggest List customers not located in the USA SCHEMA: CREATE TABLE Customers (CustomerName TEXT, Country TEXT);' },
  { id: 's12', icon: Zap, text: 'Optimize a complex filter', subtext: 'Improve query with multiple AND/OR conditions.', command: '/optimize SELECT * FROM Orders WHERE (ShipCity = \'London\' AND OrderDate > \'2024-01-01\') OR (ShipCity = \'Paris\' AND TotalAmount > 100);' },
  { id: 's13', icon: Code, text: 'Show schema for "Orders" table', subtext: 'View the structure of the Orders table.', command: 'PRAGMA table_info(Orders);' },
  { id: 's14', icon: Sparkles, text: 'Average order value', subtext: 'SQL to calculate the average total amount of orders.', command: '/suggest Calculate the average order value SCHEMA: CREATE TABLE Orders (TotalAmount REAL);' },
  { id: 's15', icon: Zap, text: 'Optimize query with LIKE', subtext: 'Tips for queries using wildcard searches.', command: '/optimize SELECT * FROM Customers WHERE CustomerName LIKE \'%Alfreds%\';' },
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


export default function AiPage() {
  const [inputValue, setInputValue] = useState('');
  const [aiResponse, setAiResponse] = useState<AiResponseType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOperation, setCurrentOperation] = useState<'explain' | 'optimize' | 'suggest' | null>(null);
  const { toast } = useToast();

  const [topSuggestions, setTopSuggestions] = useState<Suggestion[]>([]);
  const [showTopSuggestionsSection, setShowTopSuggestionsSection] = useState(true);
  
  useEffect(() => {
    const shuffled = shuffleArray(allPossibleSuggestions);
    setTopSuggestions(shuffled.slice(0, 5));
  }, []);


  const handleSuggestionClick = (command: string) => {
    setInputValue(command);
  };
  
  const handleSubmit = async (currentInput?: string) => {
    const queryToProcess = typeof currentInput === 'string' ? currentInput : inputValue;
    setIsLoading(true);
    setAiResponse(null);
    setError(null);
    setCurrentOperation(null);
    const trimmedInput = queryToProcess.trim();

    if (!trimmedInput) {
      setError("Please enter a request or an SQL query.");
      setIsLoading(false);
      return;
    }

    try {
      if (trimmedInput.toLowerCase().startsWith('/explain ')) {
        const sqlQuery = trimmedInput.substring('/explain '.length).trim();
        if (!sqlQuery) {
          setError("Please provide an SQL query to explain after /explain.");
          setIsLoading(false);
          return;
        }
        setCurrentOperation('explain');
        const result = await explainSql({ sqlQuery });
        setAiResponse(result);
      } else if (trimmedInput.toLowerCase().startsWith('/optimize ')) {
        const sqlQuery = trimmedInput.substring('/optimize '.length).trim();
        if (!sqlQuery) {
          setError("Please provide an SQL query to optimize after /optimize.");
          setIsLoading(false);
          return;
        }
        setCurrentOperation('optimize');
        const result = await optimizeSql({ sqlQuery });
        setAiResponse(result);
      } else if (trimmedInput.toLowerCase().startsWith('/suggest ')) {
        let commandContent = trimmedInput.substring('/suggest '.length).trim();
        let description = commandContent;
        let tableSchema = DEFAULT_TABLE_SCHEMA;

        if (!commandContent) {
          setError("Please provide a description for the SQL query after /suggest.");
          setIsLoading(false);
          return;
        }

        const schemaKeyword = 'SCHEMA:';
        const schemaIndex = commandContent.toUpperCase().indexOf(schemaKeyword);

        if (schemaIndex !== -1) {
          tableSchema = commandContent.substring(schemaIndex + schemaKeyword.length).trim();
          description = commandContent.substring(0, schemaIndex).trim();
          if (!tableSchema) tableSchema = DEFAULT_TABLE_SCHEMA; 
        }
        
        if (!description && tableSchema === DEFAULT_TABLE_SCHEMA) {
          setError("Please provide a description for the SQL query. Using '/suggest SCHEMA: ...' requires a description too.");
          setIsLoading(false);
          return;
        }
        if (!description && tableSchema !== DEFAULT_TABLE_SCHEMA) {
            description = "Suggest a query based on the provided schema."; 
        }

        setCurrentOperation('suggest');
        const result = await suggestSql({ description, tableSchema });
        setAiResponse(result);
      } else {
        setCurrentOperation('suggest'); 
        const result = await suggestSql({ description: trimmedInput, tableSchema: DEFAULT_TABLE_SCHEMA });
        setAiResponse(result);
      }
    } catch (e: any) {
      console.error("AI operation failed:", e);
      setError(e.message || 'An unexpected error occurred. Please try again.');
      setAiResponse(null); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast({ title: "Copied to clipboard!", variant: "default" });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({ title: "Failed to copy", description: "Could not copy text to clipboard.", variant: "destructive" });
      });
  };

  const renderResponseContent = () => {
    if (!aiResponse || !currentOperation) return null;

    const codeBlockClasses = "whitespace-pre-wrap p-3 bg-muted/80 dark:bg-slate-800 dark:text-slate-100 rounded-md text-sm font-mono shadow-inner border border-border/50";
    const codeWrapperClasses = "relative group"; // Added group for copy button visibility

    switch (currentOperation) {
      case 'explain':
        const explainRes = aiResponse as ExplainSqlOutput;
        const htmlExplanation = marked.parse(explainRes.explanation);
        return <div className="text-sm prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlExplanation as string }} />;
      
      case 'optimize':
        const optimizeRes = aiResponse as OptimizeSqlOutput;
        return (
          <>
            <h4 className="font-semibold mt-1 mb-1 text-base text-foreground/90">Optimized Query:</h4>
            <div className={codeWrapperClasses}>
              <pre className={codeBlockClasses}>{optimizeRes.optimizedQuery}</pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:opacity-100 hover:text-primary"
                onClick={() => handleCopyCode(optimizeRes.optimizedQuery)}
                title="Copy optimized query"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {optimizeRes.suggestions && optimizeRes.suggestions.length > 0 && (
              <>
                <h4 className="font-semibold mt-3 mb-1 text-base text-foreground/90">Suggestions:</h4>
                <ul className="list-disc list-inside pl-4 space-y-1 text-sm text-muted-foreground">
                  {optimizeRes.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        );

      case 'suggest':
        const suggestRes = aiResponse as SuggestSqlOutput;
        return (
          <>
            <h4 className="font-semibold mt-1 mb-1 text-base text-foreground/90">Suggested Query:</h4>
            <div className={codeWrapperClasses}>
              <pre className={codeBlockClasses}>{suggestRes.sqlQuery}</pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:opacity-100 hover:text-primary"
                onClick={() => handleCopyCode(suggestRes.sqlQuery)}
                title="Copy suggested query"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </>
        );
      default:
        const contentToDisplay = typeof aiResponse === 'object' ? JSON.stringify(aiResponse, null, 2) : String(aiResponse);
        return (
             <div className={codeWrapperClasses}>
                <pre className={codeBlockClasses}>{contentToDisplay}</pre>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 focus:opacity-100 hover:text-primary"
                    onClick={() => handleCopyCode(contentToDisplay)}
                    title="Copy raw response"
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        );
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };


  return (
    <div className="space-y-6">
       <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          AI Assistant
        </span>
      </h1>

      <Card className="shadow-lg border-border/30">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center">
            <Sparkles className="h-7 w-7 text-primary mr-3 animate-glow-y-bounce" />
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AI Suggestions
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowTopSuggestionsSection(!showTopSuggestionsSection)} className="text-muted-foreground hover:text-primary">
            {showTopSuggestionsSection ? "Hide" : "Show"}
            {showTopSuggestionsSection ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        </CardHeader>
        {showTopSuggestionsSection && (
          <CardContent className="pt-0 pb-4">
            {topSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topSuggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.command)}
                    className="group text-left p-3 rounded-lg border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <div className="flex items-center mb-1.5">
                      <suggestion.icon className="h-5 w-5 text-primary/80 mr-2.5 group-hover:text-primary transition-colors" />
                      <p className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors">{suggestion.text}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{suggestion.subtext}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Loading suggestions...</p>
            )}
          </CardContent>
        )}
      </Card>


      <Card className="shadow-xl border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground/90">AI Powered SQL Assistance</CardTitle>
           <CardDescription className="text-sm text-muted-foreground mt-1">
            Use slash commands: <code className="bg-muted px-1 py-0.5 rounded-sm text-xs">/explain</code>, <code className="bg-muted px-1 py-0.5 rounded-sm text-xs">/optimize</code>, or <code className="bg-muted px-1 py-0.5 rounded-sm text-xs">/suggest</code>. 
            For <code className="bg-muted px-1 py-0.5 rounded-sm text-xs">/suggest</code>, add <code className="bg-muted px-1 py-0.5 rounded-sm text-xs">SCHEMA: your_table_schema</code> for specificity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2"> 
          <div>
            <Textarea
              id="ai-input-textarea"
              placeholder="e.g., /explain SELECT * FROM users WHERE age > 30 OR type your SQL query problem..."
              className="min-h-[150px] text-base focus:ring-primary/50 border-border/70 rounded-lg p-4 font-mono shadow-inner"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-between items-center gap-3 pt-1">
             <p className="text-xs text-muted-foreground">Shift + Enter for newline</p>
             <Button onClick={() => handleSubmit()} disabled={isLoading || !inputValue.trim()} size="lg" 
                  variant="success"
                  className="rounded-lg px-6 py-2.5" 
              >
              {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                  <Send className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Processing...' : 'Send'}
              </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mt-6 bg-muted/20 border-border/50 rounded-lg shadow-inner">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-lg text-foreground/80">AI Response</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[100px] pt-2 pb-4">
              {isLoading && (
                <div className="flex items-center space-x-2 text-muted-foreground py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>The AI is thinking...</span>
                </div>
              )}
              {!isLoading && !error && aiResponse && renderResponseContent()}
              {!isLoading && !error && !aiResponse && (
                <p className="text-muted-foreground italic py-4">AI suggestions and explanations will appear here...</p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

