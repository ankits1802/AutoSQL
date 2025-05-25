
import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient'; // Import the new client component

export const metadata: Metadata = {
  title: 'AutoSQL - Intelligent Database Playground', // Updated title
  description: 'A comprehensive platform for SQL development, database design, and theoretical database concepts with AI power.', // Updated description
  icons: null, // Explicitly prevent default favicon handling for the root page
};

export default function HomePage() {
  return <LandingPageClient />;
}
