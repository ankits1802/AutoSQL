
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, FileEdit, UploadCloud, Database, ListChecks, Brain, Gauge, Settings, HelpCircle, GitCompareArrows } from 'lucide-react'; // Languages icon changed to GitCompareArrows

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  hasSubmenu?: boolean; 
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Editor',
    href: '/editor',
    icon: FileEdit,
  },
  {
    title: 'Uploads',
    href: '/uploads',
    icon: UploadCloud,
  },
  {
    title: 'Schema', 
    href: '/schema',
    icon: Database,
    hasSubmenu: false, // Chevron removed
  },
  {
    title: 'Results', 
    href: '/results',
    icon: ListChecks,
  },
  {
    title: 'AI Assistant',
    href: '/ai',
    icon: Brain,
  },
  {
    title: 'Dialect Converter', 
    href: '/dialect-converter',
    icon: GitCompareArrows, 
  },
  {
    title: 'Performance',
    href: '/performance',
    icon: Gauge,
    hasSubmenu: false, // Chevron removed
  },
  // Settings and Help are now main nav items
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
];
