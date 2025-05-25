
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Zap, Cpu, BarChart2 as RechartsBarIcon, LineChart as RechartsLineIcon, Activity, DatabaseZap, Percent, ListTree, AlertTriangle, Loader2, ExternalLink, Lightbulb } from "lucide-react"; // Renamed to avoid conflict
import {
  LineChart,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { PerformanceMetricsResponse } from '@/app/api/performance/metrics/route';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';


const latencyChartConfig = {
  latency: { label: "Avg Latency (ms)", color: "hsl(var(--chart-1))", icon: Zap },
  queries: { label: "Queries/hr", color: "hsl(var(--chart-2))", icon: RechartsLineIcon }, // Using LineIcon from Lucide for consistency
} satisfies ChartConfig;

const resourceChartConfig = {
  usage: { label: "Usage (%)", color: "hsl(var(--chart-3))", icon: Cpu },
} satisfies ChartConfig;

const activeConnectionsChartConfig = {
  connections: { label: "Active Connections", color: "hsl(var(--chart-4))", icon: Activity },
} satisfies ChartConfig;


const fetchPerformanceMetrics = async (): Promise<PerformanceMetricsResponse> => {
  const res = await fetch('/api/performance/metrics');
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch performance metrics');
  }
  return res.json();
};

export default function PerformancePage() {
  const { data, error, isLoading, isFetching } = useQuery<PerformanceMetricsResponse, Error>({
    queryKey: ['performanceMetrics'],
    queryFn: fetchPerformanceMetrics,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-150px)] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading performance dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Performance Insights
          </span>
        </h1>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error Loading Performance Data</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!data) {
     return (
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Performance Insights
          </span>
        </h1>
        <p className="text-muted-foreground text-center">No performance data available at the moment.</p>
      </div>
    );
  }


  const { 
    queryLatencyData, 
    resourceUsageData, 
    activeConnectionsData, 
    cacheHitRateData,
    slowQueries,
    indexSuggestions
  } = data;


  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Performance Dashboard
          </span>
        </h1>
        {isFetching && <Loader2 className="h-6 w-6 animate-spin text-primary/70" title="Refreshing data..." />}
      </div>
      
      {/* Key Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Query Latency</CardTitle>
            <Zap className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {queryLatencyData.length > 0 ? queryLatencyData[queryLatencyData.length -1].latency.toFixed(0) : 'N/A'} ms
            </div>
            <p className="text-xs text-muted-foreground pt-1">Current average execution time</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Connections</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeConnectionsData.length > 0 ? activeConnectionsData[activeConnectionsData.length -1].value.toFixed(0) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground pt-1">Current active DB connections</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cache Hit Rate</CardTitle>
            <Percent className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cacheHitRateData.rate}%</div>
            <p className="text-xs text-muted-foreground pt-1">{cacheHitRateData.hits} hits / {cacheHitRateData.reads} reads</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CPU Usage</CardTitle>
            <Cpu className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resourceUsageData.find(r => r.resource === 'CPU')?.usage.toFixed(0) ?? 'N/A'}%</div>
            <Progress value={resourceUsageData.find(r => r.resource === 'CPU')?.usage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <RechartsLineIcon className="mr-3 h-6 w-6" /> Query Latency & Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={latencyChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <LineChart data={queryLatencyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis yAxisId="left" dataKey="latency" stroke="var(--color-latency)" tickLine={false} axisLine={false} tickMargin={8} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--chart-1))', dy:40, dx: -5 }} />
                  <YAxis yAxisId="right" dataKey="queries" orientation="right" stroke="var(--color-queries)" tickLine={false} axisLine={false} tickMargin={8} label={{ value: 'Queries', angle: 90, position: 'insideRight', fill: 'hsl(var(--chart-2))', dy: -20, dx: 5}}/>
                  <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                  <Legend content={<ChartLegendContent />} />
                  <Line yAxisId="left" type="monotone" dataKey="latency" stroke="var(--color-latency)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-latency)" }} activeDot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="queries" stroke="var(--color-queries)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-queries)" }} activeDot={{ r: 5 }}/>
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <RechartsBarIcon className="mr-3 h-6 w-6" /> Average Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={resourceChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={resourceUsageData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid horizontal={false} stroke="hsl(var(--border)/0.5)" />
                  <XAxis type="number" dataKey="usage" domain={[0, 100]} unit="%" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis type="category" dataKey="resource" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Legend content={<ChartLegendContent />} />
                  <Bar dataKey="usage" fill="var(--color-usage)" radius={[0, 4, 4, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-primary/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <Activity className="mr-3 h-6 w-6" /> Active Connections Trend (Last 8 mins)
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={activeConnectionsChartConfig} className="h-[250px] w-full">
              <ResponsiveContainer>
                <LineChart data={activeConnectionsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis dataKey="value" stroke="var(--color-connections)" tickLine={false} axisLine={false} tickMargin={8} label={{ value: 'Connections', angle: -90, position: 'insideLeft', fill: 'hsl(var(--chart-4))', dy:60, dx: -5 }} />
                  <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
                  <Legend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="value" name="Connections" stroke="var(--color-connections)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-connections)" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Slow Queries Table */}
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <DatabaseZap className="mr-3 h-6 w-6" /> Slowest Queries
          </CardTitle>
          <CardDescription>Queries that took the longest to execute recently.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query Snippet</TableHead>
                  <TableHead className="text-right">Duration (ms)</TableHead>
                  <TableHead className="text-right">Executions</TableHead>
                  <TableHead>Last Executed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slowQueries.length > 0 ? slowQueries.map(sq => (
                  <TableRow key={sq.id}>
                    <TableCell className="font-mono text-xs max-w-sm truncate" title={sq.querySnippet}>{sq.querySnippet}</TableCell>
                    <TableCell className="text-right">{sq.durationMs}</TableCell>
                    <TableCell className="text-right">{sq.executionCount}</TableCell>
                    <TableCell>{new Date(sq.lastExecuted).toLocaleTimeString()}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No slow queries recorded.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter>
            <Button variant="link" size="sm" className="ml-auto text-xs">
                View All Slow Queries <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
        </CardFooter>
      </Card>

      {/* Index Suggestions */}
       <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <Lightbulb className="mr-3 h-6 w-6" /> Indexing Opportunities
          </CardTitle>
          <CardDescription>Potential indexes to improve query performance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            {indexSuggestions.length > 0 ? indexSuggestions.map(sugg => (
                <Card key={sugg.id} className="p-4 bg-muted/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-foreground/90">Table: <code className="text-sm bg-background px-1.5 py-0.5 rounded">{sugg.table}</code></p>
                            <p className="text-sm text-muted-foreground">Columns: <code className="text-sm bg-background px-1.5 py-0.5 rounded">{sugg.columns.join(', ')}</code></p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sugg.potentialImpact === 'High' ? 'bg-red-100 text-red-700' : sugg.potentialImpact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {sugg.potentialImpact} Impact
                        </span>
                    </div>
                     <p className="text-xs text-muted-foreground mt-1.5">{sugg.reason}</p>
                </Card>
            )) : (
                <p className="text-muted-foreground text-center py-4">No specific index suggestions at this time.</p>
            )}
        </CardContent>
         <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto text-xs">
                Analyze Database Indexes <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
        </CardFooter>
      </Card>

      <Card>
         <CardContent className="pt-6 text-sm text-muted-foreground">
            Note: All performance data displayed is illustrative mock data, dynamically generated for demonstration. 
            It refreshes automatically to simulate a real-time monitoring environment.
        </CardContent>
      </Card>
    </div>
  );
}
