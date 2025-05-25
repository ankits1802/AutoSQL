
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number; // 0-100 for upload, then used for processing indication
  message?: string; // For success or error messages from backend
}

const ALLOWED_FILE_TYPES = ['.sql', '.csv', '.json'];
const MAX_FILE_SIZE_MB = 10;

export default function UploadsPage() {
  const [selectedFiles, setSelectedFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      return `Invalid file type: ${fileExtension}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB). Max size: ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      addFilesToUpload(files);
      event.target.value = ''; 
    }
  };

  const addFilesToUpload = (files: File[]) => {
    const newUploads: UploadedFile[] = [];
    const invalidFiles: { name: string, reason: string }[] = [];

    files.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        invalidFiles.push({ name: file.name, reason: validationError });
      } else {
        newUploads.push({
          id: `${file.name}-${Date.now()}`,
          file,
          status: 'pending' as const,
          progress: 0,
        });
      }
    });

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(invalid => {
        toast({
          title: "Invalid File",
          description: `${invalid.name}: ${invalid.reason}`,
          variant: "destructive",
        });
      });
    }
    
    setSelectedFiles(prev => [...newUploads, ...prev.filter(f => f.status !== 'uploading' && f.status !== 'processing')]);
  };


  const processFile = async (fileId: string) => {
    const fileItem = selectedFiles.find(f => f.id === fileId);
    if (!fileItem) return;

    setSelectedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'uploading', progress: 0 } : f));

    // Simulate upload progress
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress <= 100) {
        setSelectedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: currentProgress } : f));
      } else {
        clearInterval(progressInterval);
         setSelectedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing', progress: 100 } : f)); // Indicate processing
      }
    }, 100);
    
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate upload time before processing starts
    clearInterval(progressInterval); // Ensure interval is cleared
    setSelectedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing', progress: 100 } : f));


    const file = fileItem.file;
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    let endpoint = '';
    let body: any;
    const formData = new FormData();


    try {
      const fileContent = await file.text();
      
      if (fileExtension === '.sql') {
        endpoint = '/api/upload/sql';
        body = JSON.stringify({ sqlContent: fileContent });
      } else if (fileExtension === '.csv') {
        endpoint = '/api/upload/csv';
        body = JSON.stringify({ fileName: file.name, csvContent: fileContent });
      } else if (fileExtension === '.json') {
        endpoint = '/api/upload/json';
        body = JSON.stringify({ fileName: file.name, jsonContent: fileContent });
      } else {
        throw new Error("Unsupported file type for processing."); // Should have been caught by validation
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to process ${file.name}`);
      }

      setSelectedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'success', message: result.message } : f));
      toast({
        title: "Processing Successful",
        description: result.message || `${file.name} processed successfully.`,
      });

    } catch (error: any) {
      console.error("Error processing file:", error);
      const errorMessage = error.message || `An error occurred while processing ${file.name}.`;
      setSelectedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error', message: errorMessage } : f));
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const handleUploadAll = () => {
    selectedFiles.forEach(f => {
      if (f.status === 'pending') {
        processFile(f.id);
      }
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true); 
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToUpload(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getTotalPendingFiles = () => selectedFiles.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-6">
       <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          File Uploads
        </span>
      </h1>
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <UploadCloud className="mr-3 h-6 w-6" /> Upload Files
          </CardTitle>
           <CardDescription>
            Upload SQL scripts (.sql), CSV data (.csv), or JSON files (.json) for processing and integration into the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={cn(
              "p-8 h-64 w-full rounded-lg border-2 border-dashed border-primary/50 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-all duration-300 cursor-pointer",
              isDragging && "bg-primary/20 border-primary ring-4 ring-primary/30 scale-[1.01]"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            role="button"
            tabIndex={0}
            aria-label="File upload drop zone"
          >
            <UploadCloud className="h-16 w-16 text-primary/70 mb-4 transition-transform group-hover:scale-110" />
            <p className="text-lg font-medium text-primary/90">
              {isDragging ? "Drop files here" : "Drag & drop files or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Supports .sql, .csv, .json (Max {MAX_FILE_SIZE_MB}MB per file)</p>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              multiple
              accept={ALLOWED_FILE_TYPES.join(',')}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground/80">Upload Queue</h3>
              {selectedFiles.map(item => (
                <Card key={item.id} className={cn(
                  "p-4 flex items-center space-x-4 shadow-md",
                  (item.status === 'uploading' || item.status === 'processing') && "bg-secondary/30",
                  item.status === 'success' && "bg-green-500/10 border-green-500/50",
                  item.status === 'error' && "bg-red-500/10 border-red-500/50"
                )}>
                  <FileText className="h-8 w-8 text-primary/80 flex-shrink-0" />
                  <div className="flex-1 space-y-1 min-w-0"> {/* Added min-w-0 for flex child proper truncation */}
                    <p className="font-medium text-sm truncate" title={item.file.name}>{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.file.size / 1024).toFixed(2)} KB - {item.file.type || 'unknown type'}
                    </p>
                    {(item.status === 'uploading' || item.status === 'processing') && (
                      <Progress value={item.progress} className="h-2 mt-1" />
                    )}
                     {item.status === 'processing' &&  <p className="text-xs text-blue-600 mt-0.5">Processing on server...</p>}
                    {(item.status === 'error' || item.status === 'success') && item.message && (
                       <p className={cn("text-xs mt-0.5", item.status === 'error' ? 'text-destructive' : 'text-green-700')}>{item.message}</p>
                    )}
                  </div>
                  {item.status === 'pending' && (
                    <Button onClick={() => processFile(item.id)} size="sm" variant="default">
                      Process File
                    </Button>
                  )}
                  {(item.status === 'uploading' || item.status === 'processing') && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                  )}
                  {item.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                  {item.status === 'error' && (
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                  <Button
                    onClick={() => handleRemoveFile(item.id)}
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    disabled={item.status === 'uploading' || item.status === 'processing'}
                    aria-label="Remove file"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        {getTotalPendingFiles() > 0 && (
            <CardFooter className="border-t pt-6">
                <Button onClick={handleUploadAll} size="lg" className="w-full md:w-auto ml-auto" disabled={selectedFiles.every(f => f.status !== 'pending')} variant="success">
                    <UploadCloud className="mr-2 h-5 w-5" />
                    Process All Pending ({getTotalPendingFiles()})
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
