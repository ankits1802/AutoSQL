'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header'; // Will be enhanced for page titles
import { MainNav } from '@/components/main-nav';
import { Database, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react'; // Database for AutoSQL
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LastExecutedQueryProvider } from '@/contexts/LastExecutedQueryContext';


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    // For landing page, render children directly without the app shell
    // Ensure it takes full width/height if needed
    return <div className="w-full min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <LastExecutedQueryProvider>
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar shadow-md">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
            <Database className="h-7 w-7 text-primary flex-shrink-0" />
            <h1 className="text-xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden whitespace-nowrap">
              AutoSQL
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1">
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/settings" passHref legacyBehavior>
                     <SidebarMenuButton
                        as="a" 
                        tooltipConfig={{children: "Settings", className: "group-data-[collapsible=icon]:flex"}}
                        className="w-full justify-start"
                        isActive={pathname === '/settings'}
                      >
                        <Settings className="h-5 w-5 flex-shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden truncate">Settings</span>
                     </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                     <Link href="/help" passHref legacyBehavior>
                     <SidebarMenuButton
                        as="a" 
                        tooltipConfig={{children: "Help & Support", className: "group-data-[collapsible=icon]:flex"}}
                        className="w-full justify-start"
                        isActive={pathname === '/help'}
                      >
                        <HelpCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden truncate">Help & Support</span>
                     </SidebarMenuButton>
                     </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                     <SidebarMenuButton 
                        tooltipConfig={{children: "Logout (Coming Soon)", className: "group-data-[collapsible=icon]:flex"}} 
                        className="w-full justify-start opacity-50 cursor-not-allowed"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                     </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <p className="text-xs text-sidebar-foreground/60 text-center pt-2 group-data-[collapsible=icon]:hidden">
                App Version: 1.0.0
            </p>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1 min-h-screen bg-background">
        <SiteHeader /> {/* SiteHeader will be responsible for displaying the page title */}
        <SidebarInset className="flex-1 p-4 md:p-6 lg:p-8 transition-opacity duration-500 opacity-0 animate-fadeIn">
          {children}
        </SidebarInset>
      </div>
    </>
    </LastExecutedQueryProvider>
  );
}
