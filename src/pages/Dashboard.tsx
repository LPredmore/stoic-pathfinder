import React, { useEffect, useRef, useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Flame, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listModes, getModeDisplayName } from "@/integrations/supabase/trainingService";

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  type Msg = { role: "user" | "assistant" | "system"; content: string };
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "How can I help you apply Stoic thinking today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
const bottomRef = useRef<HTMLDivElement | null>(null);

  const [availableModes] = useState<string[]>(listModes());
  const [selectedMode, setSelectedMode] = useState<string>(availableModes[0] ?? "express");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("ai-coach", {
      body: {
        messages: next.map((m) => ({ role: m.role, content: m.content })),
        mode: selectedMode,
      },
    });

    setLoading(false);

    if (error) {
      console.error("Chat error", error);
      // If server returned debug payload despite non-2xx, try to surface it
      if ((error as any).context?.response) {
        console.error("Edge response:", (error as any).context.response);
      }
      toast({ title: "Chat error", description: String(error.message ?? error), variant: "destructive" as any });
      return;
    }

    // Handle successful reply + optional memory save notice
    const assistant = (data as any)?.reply ?? "(no response)";
    const saved = (data as any)?.memoriesSaved;
    if (saved && (saved.boundaries || saved.stuck_points || saved.goals || saved.relationships || saved.values || saved.notes)) {
      const total =
        (saved.boundaries ?? 0) +
        (saved.stuck_points ?? 0) +
        (saved.goals ?? 0) +
        (saved.relationships ?? 0) +
        (saved.values ?? 0) +
        (saved.notes ?? 0);
      if (total > 0) {
        toast({
          title: "Personalization updated",
          description: `Captured ${total} new insight${total === 1 ? "" : "s"} to tailor your coaching.`,
        });
      }
    }

    setMessages((prev) => [...prev, { role: "assistant", content: assistant }]);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="opacity-70" /> Live Coaching Chat
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-muted-foreground md:inline">Mode</span>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {getModeDisplayName(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] rounded-md border bg-muted/30">
              <ScrollArea className="h-full p-4">
                <div className="flex flex-col gap-3">
                  {messages.filter(m => m.role !== 'system').map((m, idx) => (
                    <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                      <div
                        className={
                          m.role === 'user'
                            ? 'max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground'
                            : 'max-w-[85%] rounded-lg bg-accent px-3 py-2 text-accent-foreground'
                        }
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <Button variant="default" onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? 'Sending…' : 'Send'}
              </Button>
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
