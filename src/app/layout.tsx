
'use client';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/AppShell';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { LastExecutedQueryProvider } from '@/contexts/LastExecutedQueryContext';


const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Metadata cannot be exported from a client component.
// If global metadata is needed, providers should be extracted to a client component
// and this layout should remain a server component.
// export const metadata: Metadata = {
//   title: 'SQL Artisan Pro',
//   description: 'A full-featured web platform to write, execute, and analyze SQL queries with AI power.',
//   icons: null, 
// };

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Metadata tags can be placed here if necessary, or in individual page.tsx files */}
        {/* For example, a default title if not overridden by pages: */}
        <title>SQL Artisan Pro</title>
        <meta name="description" content="A full-featured web platform to write, execute, and analyze SQL queries with AI power." />
      </head>
      <body className={`${geist.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <LastExecutedQueryProvider>
              <SidebarProvider defaultOpen>
                <AppShell>{children}</AppShell>
              </SidebarProvider>
            </LastExecutedQueryProvider>
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

