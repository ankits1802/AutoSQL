
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for the query result based on the usage in src/app/editor/page.tsx
// This QueryResultType is the direct response from the /api/db/execute endpoint
export type ApiQueryResultType = {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  executionTime?: string;
  rowCount?: number;
  error?: string;
  message?: string; // General message from backend, often the first/primary message
  messages?: string[]; // Array of messages, typically for multi-statement results
  changes?: number | bigint;
  lastInsertRowid?: number | bigint;
};

// This is the data structure stored in the context
export interface LastExecutedQueryData {
  sql: string;
  results: ApiQueryResultType | null; // Results from the API call
  timestamp: Date;
}

interface LastExecutedQueryContextProps {
  lastExecutedQuery: LastExecutedQueryData | null;
  setLastExecutedQuery: (queryData: LastExecutedQueryData | null) => void;
}

const LastExecutedQueryContext = createContext<LastExecutedQueryContextProps | undefined>(undefined);

export const LastExecutedQueryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastExecutedQuery, setLastExecutedQueryState] = useState<LastExecutedQueryData | null>(null);

  // This function will be provided by the context to update the state
  const setLastExecutedQuery = (queryData: LastExecutedQueryData | null) => {
    setLastExecutedQueryState(queryData);
  };

  return (
    <LastExecutedQueryContext.Provider value={{ lastExecutedQuery, setLastExecutedQuery }}>
      {children}
    </LastExecutedQueryContext.Provider>
  );
};

export const useLastExecutedQuery = () => {
  const context = useContext(LastExecutedQueryContext);
  if (context === undefined) {
    throw new Error('useLastExecutedQuery must be used within a LastExecutedQueryProvider');
  }
  return context;
};
