
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <BackButton />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {mounted && ( // Only render theme toggle button on client
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
