import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Flame, Target } from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    <div className="container py-10">
      <SEO
        title="Dashboard – Stoic Accountability Coach"
        description="Chat with your coach, keep streaks, and jump into today's lesson or active goal."
      />

      <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="opacity-70" /> Live Coaching Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] rounded-md border bg-muted/30">
              <ScrollArea className="h-full p-4 space-y-3">
                <div className="text-muted-foreground">Conversation will appear here.</div>
              </ScrollArea>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input placeholder="Type a message…" />
              <Button variant="default">Send</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="text-primary" /> Habit Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">You're on a 4‑day streak. Keep going!</p>
              <div className="mt-3 h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-2/3 rounded-full bg-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-primary" /> Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="secondary" asChild>
                <a href="/story">Today's Lesson</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/goals">Active Goal</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
