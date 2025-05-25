'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListChecks, PlayCircle, Database, Gauge, UploadCloud, Lightbulb, Edit3, ChevronRight, GitCompareArrows } from "lucide-react";
import Link from 'next/link';
import { SchemaTableCountStat } from '@/components/dashboard/SchemaTableCountStat';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  icon: React.ElementType;
  description?: string;
  link?: string;
  linkText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, link, linkText }) => (
  <Card className="shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
    </CardContent>
    {link && linkText && (
      <CardFooter className="pt-0">
        <Button size="sm" variant="link" asChild className="px-0 text-xs">
          <Link href={link}>
            {linkText} <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    )}
  </Card>
);


const mockRecentActivities = [
  { id: 1, user: "Alice Wonderland", avatar: "https://placehold.co/40x40/E0E7FF/4F46E5.png?text=AW", action: "Executed 'Top 5 Products by Sales'", time: "2m ago", type: "query" as const, icon: PlayCircle },
  { id: 2, user: "Bob The Builder", avatar: "https://placehold.co/40x40/FEE2E2/B91C1C.png?text=BB", action: "Viewed 'Customers' table schema", time: "15m ago", type: "schema" as const, icon: Database },
  { id: 3, user: "Charlie Brown", avatar: "https://placehold.co/40x40/FEF9C3/F59E0B.png?text=CB", action: "Uploaded 'quarterly_sales.csv'", time: "1h ago", type: "upload" as const, icon: UploadCloud },
  { id: 4, user: "Diana Prince", avatar: "https://placehold.co/40x40/D1FAE5/059669.png?text=DP", action: "Optimized 'Slow Order Query'", time: "3h ago", type: "ai" as const, icon: Lightbulb },
  { id: 5, user: "Edward Scissorhands", avatar: "https://placehold.co/40x40/DDD6FE/5B21B6.png?text=ES", action: "Explained 'Complex Join Logic'", time: "5h ago", type: "ai" as const, icon: Lightbulb },
];

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
       setCurrentTime(new Date().toLocaleTimeString());
    }, 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);


  return (
    <div className="space-y-8">
       <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Dashboard
        </span>
      </h1>
      <Card className="bg-card shadow-xl border-primary/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground/90">Welcome to SQL Artisan Pro!</CardTitle>
              <CardDescription className="mt-1 text-base text-muted-foreground">
                Your intelligent workspace for mastering SQL.
              </CardDescription>
            </div>
            {currentTime && (
                <Badge variant="outline" className="mt-2 sm:mt-0 text-sm py-1.5 px-3">
                    Local Time: {currentTime}
                </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Navigate using the sidebar to write queries, explore schemas, get AI assistance, and more.
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Queries Run Today" value="125" icon={PlayCircle} description="+15 from yesterday" />
        <SchemaTableCountStat />
        <StatCard title="Avg. Query Latency" value="85ms" icon={Gauge} description="Last 24 hours" />
        <StatCard title="Files Uploaded" value="8" icon={UploadCloud} description="This week" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions Card */}
        <Card className="md:col-span-1 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-foreground/90">
              <Edit3 className="mr-3 h-6 w-6 text-primary" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              variant="secondary" // Use secondary for lighter default
              className="w-full justify-start py-6 group hover:border-primary/60 transition-all"
            >
              <Link href="/editor">
                <PlayCircle className="mr-3 h-5 w-5 text-primary/80 group-hover:text-primary transition-colors" />
                <span className="flex-1 min-w-0 group-hover:text-primary transition-colors text-sm md:text-base">New Query / Editor</span>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full justify-start py-6 group hover:border-primary/60 transition-all"
            >
              <Link href="/schema">
                <Database className="mr-3 h-5 w-5 text-primary/80 group-hover:text-primary transition-colors" />
                <span className="flex-1 min-w-0 group-hover:text-primary transition-colors text-sm md:text-base">Browse Schema</span>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </Button>
             <Button
              asChild
              variant="secondary"
              className="w-full justify-start py-6 group hover:border-primary/60 transition-all"
            >
              <Link href="/ai">
                <Lightbulb className="mr-3 h-5 w-5 text-primary/80 group-hover:text-primary transition-colors" />
                <span className="flex-1 min-w-0 group-hover:text-primary transition-colors text-sm md:text-base">AI Assistant</span>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </Button>
             <Button
              asChild
              variant="secondary"
              className="w-full justify-start py-6 group hover:border-primary/60 transition-all"
            >
              <Link href="/dialect-converter">
                <GitCompareArrows className="mr-3 h-5 w-5 text-primary/80 group-hover:text-primary transition-colors" />
                <span className="flex-1 min-w-0 group-hover:text-primary transition-colors text-sm md:text-base">Dialect Converter</span>
                <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="md:col-span-2 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-foreground/90">
              <ListChecks className="mr-3 h-6 w-6 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivities.map(activity => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors border border-transparent hover:border-primary/20">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.avatar} alt={activity.user} data-ai-hint="person portrait" />
                    <AvatarFallback>{activity.user.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground/90">
                        <span className="font-semibold">{activity.user}</span> {activity.action.split(' ')[0].toLowerCase().endsWith('ed') ? '' : activity.type === 'query' ? 'ran' : activity.type === 'schema' ? 'viewed' : activity.type === 'upload' ? 'uploaded' : 'used AI for'} <span className="text-primary/90">{activity.action.substring(activity.action.indexOf(' ')+1)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <activity.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
           <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                    View All Activity <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
           </CardFooter>
        </Card>
      </div>

    </div>
  );
}
