import React, { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

 type Question = {
  id: string;
  code: string;
  text: string;
  source: string;
  responses?: { response_value: number | null }[] | null;
};

const SOURCES = ["vignette", "role_adoption", "metaphor", "forced_choice", "third_person"] as const;

const AdminExam: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, number | "">>({});

  useEffect(() => {
    const load = async () => {
      try {
        // Get current user's profile id
        const { data: sessionData } = await supabase.auth.getSession();
        const uid = sessionData.session?.user?.id;
        if (!uid) {
          setLoading(false);
          return;
        }
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", uid)
          .maybeSingle();
        if (profErr) throw profErr;
        const pid = (prof as any)?.id as string | undefined;
        if (!pid) {
          setLoading(false);
          return;
        }
        setProfileId(pid);

        // Load questions with embedded responses (RLS limits to current user)
        const { data, error } = await supabase
          .from("questions")
          .select("id, code, text, source, responses(response_value)")
          .in("source", SOURCES as unknown as string[])
          .order("code", { ascending: true });
        if (error) throw error;

        const qs = (data || []) as Question[];
        setQuestions(qs);
        const respMap: Record<string, number | ""> = {};
        qs.forEach((q) => {
          const val = q.responses?.[0]?.response_value;
          respMap[q.id] = typeof val === "number" ? val : "";
        });
        setResponses(respMap);
      } catch (e: any) {
        toast({ title: "Failed to load exam", description: e.message, variant: "destructive" as any });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  const handleSave = async () => {
    try {
      if (!profileId) return;
      setSaving(true);
      const upserts = questions
        .map((q) => ({
          profile_id: profileId,
          question_id: q.id,
          response_value: responses[q.id] === "" ? null : Number(responses[q.id]),
          source: q.source,
        }))
        // Only send rows where a value is chosen
        .filter((r) => r.response_value !== null);

      if (upserts.length === 0) {
        toast({ title: "Nothing to save", description: "Select responses first." });
        return;
      }

      const { error } = await supabase
        .from("responses")
        .upsert(upserts, { onConflict: "profile_id,question_id" });
      if (error) throw error;

      toast({ title: "Saved", description: "All responses have been saved." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-10">
      <SEO title="Admin Exam | Stoic Coach" description="Administer and record assessment responses (1–5 scale)." />

      <Card>
        <CardHeader>
          <CardTitle>Admin Exam Page</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-64 animate-pulse rounded bg-muted" />
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <div className="space-y-6">
              {questions.length === 0 && (
                <p className="text-sm text-muted-foreground">No questions found for selected sources.</p>
              )}
              {questions.map((q) => (
                <div key={q.id} className="grid gap-2">
                  <p className="font-medium">{q.text}</p>
                  <div className="max-w-xs">
                    <Select
                      value={responses[q.id] === "" ? "" : String(responses[q.id])}
                      onValueChange={(v) =>
                        setResponses((prev) => ({ ...prev, [q.id]: v ? Number(v) : "" }))
                      }
                    >
                      <SelectTrigger aria-label="Select response">
                        <SelectValue placeholder="— select 1–5 —" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save All"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExam;
