
// src/app/api/performance/metrics/route.ts
import { NextResponse } from 'next/server';

interface TimeSeriesDataPoint {
  time: string; // e.g., "08:00", "09:00"
  value: number;
}

interface QueryLatencyPoint {
  time: string;
  latency: number; // ms
  queries: number; // count
}

interface ResourceUsagePoint {
  resource: string;
  usage: number; // percentage
  limit: number; // percentage (always 100 for usage)
}

interface SlowQuery {
  id: string;
  querySnippet: string;
  durationMs: number;
  lastExecuted: string;
  executionCount: number;
}

interface IndexSuggestion {
  id: string;
  table: string;
  columns: string[];
  reason: string;
  potentialImpact: 'High' | 'Medium' | 'Low';
}

export interface PerformanceMetricsResponse {
  queryLatencyData: QueryLatencyPoint[];
  resourceUsageData: ResourceUsagePoint[];
  activeConnectionsData: TimeSeriesDataPoint[];
  cacheHitRateData: {
    rate: number; // percentage
    reads: number;
    hits: number;
  };
  slowQueries: SlowQuery[];
  indexSuggestions: IndexSuggestion[];
}

let requestCount = 0; // To make data slightly dynamic

function generateDynamicLatencyData(): QueryLatencyPoint[] {
  const baseTimes = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  return baseTimes.map((time, index) => ({
    time,
    latency: 100 + Math.sin(index + requestCount * 0.1) * 50 + Math.random() * 20, // Fluctuate around 100-150ms
    queries: 15 + Math.cos(index + requestCount * 0.1) * 5 + Math.floor(Math.random() * 5), // Fluctuate around 10-20
  }));
}

function generateDynamicResourceUsage(): ResourceUsagePoint[] {
  return [
    { resource: "CPU", usage: Math.min(95, 60 + Math.sin(requestCount * 0.2) * 20 + Math.random() * 10), limit: 100 },
    { resource: "Memory", usage: Math.min(95, 50 + Math.cos(requestCount * 0.2 + 1) * 15 + Math.random() * 10), limit: 100 },
    { resource: "Disk I/O", usage: Math.min(95, 30 + Math.sin(requestCount * 0.2 + 2) * 10 + Math.random() * 5), limit: 100 },
    { resource: "Network", usage: Math.min(95, 20 + Math.cos(requestCount * 0.2 + 3) * 5 + Math.random() * 5), limit: 100 },
  ];
}

function generateDynamicActiveConnections(): TimeSeriesDataPoint[] {
    const baseTimes = ["-8m", "-7m", "-6m", "-5m", "-4m", "-3m", "-2m", "-1m", "Now"];
    return baseTimes.map((time, index) => ({
      time,
      value: Math.max(5, 20 + Math.sin(index * 0.5 + requestCount * 0.3) * 10 + Math.random() * 5), // Fluctuate around 10-30
    }));
}

function generateDynamicCacheHitRate(): PerformanceMetricsResponse['cacheHitRateData'] {
    const reads = 1000 + Math.floor(Math.random() * 200);
    const hits = Math.floor(reads * (0.85 + Math.sin(requestCount * 0.1) * 0.05)); // Fluctuate between 80-90%
    return {
      rate: parseFloat(((hits / reads) * 100).toFixed(2)),
      reads,
      hits,
    };
}

const mockSlowQueries: Omit<SlowQuery, 'id' | 'lastExecuted'>[] = [
    { querySnippet: "SELECT * FROM Orders JOIN Users ON ... WHERE Date > ...", durationMs: 1250, executionCount: 15 },
    { querySnippet: "UPDATE ProductAnalytics SET ... (complex subquery)", durationMs: 870, executionCount: 5 },
    { querySnippet: "SELECT COUNT(DISTINCT item_id) FROM LargeEventTable ...", durationMs: 2100, executionCount: 8 },
];

const mockIndexSuggestions: Omit<IndexSuggestion, 'id'>[] = [
    { table: "Orders", columns: ["OrderDate", "CustomerID"], reason: "Frequently filtered by date and customer.", potentialImpact: "High" },
    { table: "Products", columns: ["CategoryID"], reason: "Joins on CategoryID can be faster.", potentialImpact: "Medium" },
];


export async function GET() {
  requestCount++; // Increment to vary data over time

  const responseData: PerformanceMetricsResponse = {
    queryLatencyData: generateDynamicLatencyData(),
    resourceUsageData: generateDynamicResourceUsage(),
    activeConnectionsData: generateDynamicActiveConnections(),
    cacheHitRateData: generateDynamicCacheHitRate(),
    slowQueries: mockSlowQueries.map((sq, i) => ({
        ...sq,
        id: `sq-${i + 1}`,
        lastExecuted: new Date(Date.now() - Math.random() * 1000 * 60 * 60).toISOString(), // Random time in last hour
        durationMs: Math.floor(sq.durationMs * (0.8 + Math.random() * 0.4)) // Fluctuate duration
    })),
    indexSuggestions: mockIndexSuggestions.map((is, i) => ({...is, id: `idx-${i+1}`})),
  };

  return NextResponse.json(responseData, { status: 200 });
}
