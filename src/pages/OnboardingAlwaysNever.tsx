import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import React from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    key: "making_plans_prefer_schedule",
    label: "When making plans, do you prefer a clear schedule or leaving things open?",
  },
  {
    key: "thrill_seeking_frequency",
    label: "How often do you seek out new experiences just for the thrill of it?",
  },
  {
    key: "analyze_vs_distract_when_stressed",
    label: "When feeling stressed, do you tend to analyze what’s happening or distract yourself with activities?",
  },
  {
    key: "understand_upset_friend_immediately",
    label: "When a close friend is upset, do you immediately try to understand how they feel?",
  },
  {
    key: "rely_logic_over_gut",
    label: "When faced with a difficult decision, do you rely more on logic or on your gut feelings?",
  },
  {
    key: "follow_through_long_term_goals",
    label: "How often do you follow through on long-term goals despite obstacles?",
  },
  {
    key: "anxious_talk_it_out_vs_internal",
    label: "When you feel anxious, do you talk it out or process it internally?",
  },
] as const;

type ANKey = typeof questions[number]["key"];

type Selections = Partial<Record<ANKey, number>>;

const scale = [
  { value: 5, label: "Always" },
  { value: 4, label: "Often" },
  { value: 3, label: "Sometimes" },
  { value: 2, label: "Rarely" },
  { value: 1, label: "Never" },
];

const OnboardingAlwaysNever: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [profileId, setProfileId] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<Selections>({});

  const canContinue = questions.every((q) => typeof values[q.key] === "number");

  React.useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Ensure profile exists
        const { data: prof, error: profErr } = await (supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle());

        let pid = prof?.id as string | undefined;
        if (!pid) {
          const { data: newProf, error: insErr } = await (supabase
            .from("profiles")
            .insert({ user_id: user.id })
            .select("id")
            .single());
          if (insErr) throw insErr;
          pid = newProf.id as string;
        }
        setProfileId(pid!);

        // Load existing responses
        const { data: existing, error } = await (supabase
          .from("always_never")
          .select("*")
          .eq("profile_id", pid)
          .maybeSingle());
        if (error && error.code !== "PGRST116") throw error; // ignore no rows
        if (existing) {
          const nextValues: Selections = {};
          questions.forEach((q) => {
            const v = existing[q.key];
            if (typeof v === "number") nextValues[q.key] = v;
          });
          setValues(nextValues);
        }
      } catch (e: any) {
        console.error(e);
        toast({ title: "Error loading", description: e.message ?? "Failed to load questionnaire." , variant: "destructive" as any});
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    setSaving(true);
    try {
      const payload = { profile_id: profileId } as any;
      questions.forEach((q) => {
        payload[q.key] = values[q.key] ?? null;
      });
      const { error } = await (supabase
        .from("always_never")
        .upsert(payload, { onConflict: "profile_id" }));
      if (error) throw error;
      navigate("/onboarding/agree-disagree", { replace: true });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Could not save", description: e.message ?? "Please try again.", variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container py-10">
      <SEO title="Onboarding: Always to Never" description="Step 1 of onboarding questionnaire: Always to Never scale." />
      <Card>
        <CardHeader>
          <CardTitle>Step 1 of 2: Preferences (Always → Never)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {questions.map((q) => (
                <section key={q.key} className="space-y-3">
                  <Label className="text-base">{q.label}</Label>
                  <RadioGroup
                    value={values[q.key]?.toString() ?? ""}
                    onValueChange={(v) => setValues((prev) => ({ ...prev, [q.key]: Number(v) }))}
                    className="flex flex-wrap gap-4"
                  >
                    {scale.map((s) => (
                      <div key={s.value} className="flex items-center space-x-2">
                        <RadioGroupItem id={`${q.key}-${s.value}`} value={String(s.value)} />
                        <Label htmlFor={`${q.key}-${s.value}`}>{s.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </section>
              ))}

              <div className="flex justify-end gap-3">
                <Button type="submit" disabled={!canContinue || saving} aria-disabled={!canContinue || saving}>
                  {saving ? "Saving..." : "Continue"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default OnboardingAlwaysNever;
