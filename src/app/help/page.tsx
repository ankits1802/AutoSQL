'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Headphones, Search, MessageSquare, ExternalLink } from "lucide-react";
import Link from 'next/link';

// Define the email sending function separately
const handleSendEmail = () => {
  const recipient = "ankits1802@gmail.com"; // Replace with your actual support email
  
  // Type-safe approach using type assertions
  const subjectElement = document.getElementById("support-subject") as HTMLInputElement;
  const messageElement = document.getElementById("support-message") as HTMLTextAreaElement;
  
  // Get values with null checks
  const subject = subjectElement ? encodeURIComponent(subjectElement.value || "Support Request") : "Support Request";
  const body = messageElement ? encodeURIComponent(messageElement.value || "") : "";
  
  // Basic validation
  if (!subjectElement?.value.trim()) {
    alert("Please enter a subject");
    return;
  }
  
  if (!messageElement?.value.trim()) {
    alert("Please enter your message");
    return;
  }
  
  // Redirect to email client
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
};

const faqs = [
  {
    question: "How do I use the SQL Editor?",
    answer: "Navigate to the 'Editor' page from the sidebar. You can type your SQL queries directly into the editor. Use the 'Execute Query', 'Analyze Query', or other action buttons. Results and AI feedback will appear in the cards below the editor."
  },
  {
    question: "How can I view my database schema?",
    answer: "Go to the 'Schema' page. It displays all the tables in your connected SQLite database. Click on a table name to expand and see its columns, data types, and constraints."
  },
  {
    question: "What file types can I upload?",
    answer: "The 'Uploads' page currently supports mock uploads for .sql, .csv, and .json files. In a production environment, these could be used to run scripts or import data."
  },
  {
    question: "How does the AI Assistant work?",
    answer: "On the 'AI Assistant' page, you can use slash commands like /suggest, /explain, or /optimize followed by your query or description. For /suggest, you can also include a SCHEMA: block with your table structure for more accurate suggestions."
  },
  {
    question: "Where can I find performance metrics?",
    answer: "The 'Performance' page shows mock data for query latency and resource usage. In a real system, this would display live metrics from your database."
  }
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Help & Support Center
        </span>
      </h1>

      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <Search className="mr-3 h-6 w-6" /> Search FAQs
          </CardTitle>
          <CardDescription>Find answers to common questions quickly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            type="search" 
            placeholder="Type keywords to search FAQs..." 
            className="text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>
      
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <MessageSquare className="mr-3 h-6 w-6" /> Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border border-border rounded-lg shadow-sm bg-card overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors text-base text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 bg-muted/30 border-t border-border text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-4">No FAQs found matching your search term.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <Headphones className="mr-3 h-6 w-6" /> Contact Support
            </CardTitle>
            <CardDescription>Can't find what you're looking for? Reach out to our support team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="support-subject">Subject</Label>
                <Input id="support-subject" placeholder="e.g., Issue with query optimization" />
            </div>
            <div className="space-y-1">
                <Label htmlFor="support-message">Your Message</Label>
                <Textarea id="support-message" placeholder="Describe your issue or question in detail..." rows={5} />
            </div>
             <Button className="w-full" onClick={handleSendEmail} variant="default">
                Send Message
            </Button>
          </CardContent>
           <CardFooter className="text-xs text-muted-foreground">
            Support responses are typically within 24-48 hours.
          </CardFooter>
        </Card>

        <Card className="shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center">
              <BookOpen className="mr-3 h-6 w-6" /> Documentation & Resources
            </CardTitle>
            <CardDescription>Explore our comprehensive guides and learning materials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start py-4" asChild>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4"/> Full Documentation
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start py-4" asChild>
               <Link href="#" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4"/> API Reference
              </Link>
            </Button>
             <Button variant="outline" className="w-full justify-start py-4" asChild>
               <Link href="#" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4"/> Community Forum
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
