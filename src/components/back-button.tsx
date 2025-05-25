'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's a history to go back to
    // Note: window.history.length might not be perfectly reliable for complex SPAs or iframes.
    // A more robust solution might involve managing history state within the app.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to a default route if no history (e.g., direct navigation to a deep link)
      router.push('/dashboard');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      aria-label="Go back"
      className="transition-opacity hover:opacity-80"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
