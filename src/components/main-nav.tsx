
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems, type NavItem } from '@/config/nav';
import { cn } from '@/lib/utils';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-2">
      {navItems.map((item: NavItem) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href.length > 1);
        
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                as="a" 
                isActive={isActive}
                className="w-full justify-start"
                tooltipConfig={{ children: item.title, className: "group-data-[collapsible=icon]:flex" }}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground")} />
                <span className={cn("group-data-[collapsible=icon]:hidden truncate flex-1", isActive ? "text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground")}>
                  {item.title}
                </span>
                {/* Conditional rendering of chevron based on hasSubmenu prop */}
                {item.hasSubmenu && <ChevronRight className="h-4 w-4 ml-auto text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
