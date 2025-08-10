import { SEO } from "@/components/SEO";
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
    key: "energized_by_many_people",
    label: "Do you find yourself energized by spending time with many people, or do you feel more restored alone?",
  },
  {
    key: "own_emotions_easier_than_others",
    label: "Do you find handling your own emotions easier than helping others with theirs?",
  },
  { key: "highly_organized_person", label: "Would you describe yourself as a highly organized person?" },
  {
    key: "notice_subtle_mood_changes",
    label: "How strongly do you agree: ‘I often notice subtle changes in how people are feeling.’",
  },
  {
    key: "comfortable_challenging_norms",
    label: "Do you stick to traditions, or are you comfortable challenging norms?",
  },
  { key: "easy_to_admit_wrong", label: "Do you find it easy to admit when you’re wrong?" },
  { key: "prefer_exploring_new_ideas", label: "Would you rather explore new ideas or build on proven methods?" },
  {
    key: "fairness_honesty_important",
    label: "How important is it for you to be seen as fair and honest in your daily life?",
  },
] as const;

type AGKey = typeof questions[number]["key"];

type Selections = Partial<Record<AGKey, number>>;

const scale = [
  { value: 5, label: "Strongly agree" },
  { value: 4, label: "Agree" },
  { value: 3, label: "Neutral" },
  { value: 2, label: "Disagree" },
  { value: 1, label: "Strongly disagree" },
];

const OnboardingAgreeDisagree: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [profileId, setProfileId] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<Selections>({});

  const canFinish = questions.every((q) => typeof values[q.key] === "number");

  React.useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Ensure profile exists
        const { data: prof } = await (supabase
          .from<any>("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle());

        let pid = prof?.id as string | undefined;
        if (!pid) {
          const { data: newProf, error: insErr } = await (supabase
            .from<any>("profiles")
            .insert({ user_id: user.id })
            .select("id")
            .single());
          if (insErr) throw insErr;
          pid = newProf.id as string;
        }
        setProfileId(pid!);

        // Load existing responses
        const { data: existing, error } = await (supabase
          .from<any>("agree_disagree")
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
        .from<any>("agree_disagree")
        .upsert(payload, { onConflict: "profile_id" }));
      if (error) throw error;
      // After finishing, send to dashboard; ProtectedRoute will allow it only if both pages complete
      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Could not save", description: e.message ?? "Please try again.", variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container py-10">
      <SEO title="Onboarding: Strongly Agree to Disagree" description="Step 2 of onboarding questionnaire: Strongly agree to strongly disagree scale." />
      <Card>
        <CardHeader>
          <CardTitle>Step 2 of 2: Beliefs (Strongly Agree → Strongly Disagree)</CardTitle>
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

              <div className="flex justify-between gap-3">
                <Button type="button" variant="secondary" onClick={() => navigate("/onboarding/always-never")}>Back</Button>
                <Button type="submit" disabled={!canFinish || saving}>
                  {saving ? "Saving..." : "Finish"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default OnboardingAgreeDisagree;
