
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Palette, Bell, Save, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_AVATAR_PLACEHOLDER = "https://placehold.co/100x100/E0E7FF/4F46E5.png?text=AD";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Profile States
  const [name, setName] = React.useState("Alex Doe");
  const [email, setEmail] = React.useState("alex.doe@example.com");
  const [bio, setBio] = React.useState("SQL enthusiast and data wizard.");
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(DEFAULT_AVATAR_PLACEHOLDER);
  
  // Notification States
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(false);
  
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    setMounted(true); 
    
    const storedName = localStorage.getItem("profileName");
    if (storedName) setName(storedName);

    const storedEmail = localStorage.getItem("profileEmail");
    if (storedEmail) setEmail(storedEmail);

    const storedBio = localStorage.getItem("profileBio");
    if (storedBio) setBio(storedBio);

    const storedAvatar = localStorage.getItem("profileAvatarPreview");
    if (storedAvatar) {
        setAvatarPreview(storedAvatar);
    } else {
        setAvatarPreview(DEFAULT_AVATAR_PLACEHOLDER); 
    }

    const storedEmailNotifs = localStorage.getItem("profileEmailNotifications");
    if (storedEmailNotifs !== null) setEmailNotifications(storedEmailNotifs === 'true');

    const storedPushNotifs = localStorage.getItem("profilePushNotifications");
    if (storedPushNotifs !== null) setPushNotifications(storedPushNotifs === 'true');

  }, []);


  const handleSaveChanges = () => {
    if (!mounted) return; // Should not happen if button is disabled correctly

    localStorage.setItem("profileName", name);
    localStorage.setItem("profileEmail", email);
    localStorage.setItem("profileBio", bio);

    if (avatarPreview && avatarPreview !== DEFAULT_AVATAR_PLACEHOLDER) {
      localStorage.setItem("profileAvatarPreview", avatarPreview);
    } else {
      localStorage.removeItem("profileAvatarPreview");
    }
    localStorage.setItem("profileEmailNotifications", String(emailNotifications));
    localStorage.setItem("profilePushNotifications", String(pushNotifications));

    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved locally in this browser.",
      variant: "default", // or "success" if you have that variant
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast({ title: "Avatar Preview Updated", description: "Click 'Save All Changes' to persist." });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ title: "Invalid File Type", description: "Please select an image file (JPG, PNG, GIF).", variant: "destructive" });
    }
  };

  const getInitials = (nameString: string) => {
    if (!nameString) return 'AD';
    const names = nameString.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Application Settings
        </span>
      </h1>
      
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <User className="mr-3 h-6 w-6" /> Profile Settings
          </CardTitle>
          <CardDescription>Manage your personal information and account details. Changes are saved locally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || undefined} alt={name} data-ai-hint="person portrait" />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="secondary" size="sm" onClick={() => avatarInputRef.current?.click()} disabled={!mounted}>
                <UploadCloud className="mr-2 h-4 w-4" /> Change Avatar
              </Button>
              <input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF. Max 1MB (local preview).</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" disabled={!mounted} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={!mounted} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Tell us a little about yourself..."
              disabled={!mounted}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <Palette className="mr-3 h-6 w-6" /> Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            {mounted ? (
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="system">System Preference</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 w-full md:w-[280px] bg-muted rounded-md flex items-center px-3 text-sm text-muted-foreground animate-pulse">Loading theme...</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <Bell className="mr-3 h-6 w-6" /> Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you receive notifications. Settings are saved locally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/30">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates and alerts via email.</p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              disabled={!mounted}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/30">
            <div>
              <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Get real-time alerts directly in the app or browser.</p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
              disabled={!mounted}
            />
          </div>
        </CardContent>
      </Card>
      
      <CardFooter className="border-t pt-6 justify-end">
        <Button onClick={handleSaveChanges} size="lg" variant="default" disabled={!mounted}>
          <Save className="mr-2 h-5 w-5" /> Save All Changes
        </Button>
      </CardFooter>
    </div>
  );
}
