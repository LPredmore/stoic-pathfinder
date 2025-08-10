import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import React from "react";
import { Navigate } from "react-router-dom";

const OnboardingIndex: React.FC = () => {
  const { toast } = useToast();
  const [target, setTarget] = React.useState<string | null>(null);

  React.useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setTarget("/auth");
          return;
        }
        // Ensure profile exists
        const { data: prof } = await (supabase
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

        const anCols = [
          "making_plans_prefer_schedule",
          "thrill_seeking_frequency",
          "analyze_vs_distract_when_stressed",
          "understand_upset_friend_immediately",
          "rely_logic_over_gut",
          "follow_through_long_term_goals",
          "anxious_talk_it_out_vs_internal",
        ];
        const agCols = [
          "energized_by_many_people",
          "own_emotions_easier_than_others",
          "highly_organized_person",
          "notice_subtle_mood_changes",
          "comfortable_challenging_norms",
          "easy_to_admit_wrong",
          "prefer_exploring_new_ideas",
          "fairness_honesty_important",
        ];

        const { data: an } = await (supabase
          .from("always_never")
          .select("*")
          .eq("profile_id", pid)
          .maybeSingle());
        const { data: ag } = await (supabase
          .from("agree_disagree")
          .select("*")
          .eq("profile_id", pid)
          .maybeSingle());

        const anIncomplete = !an || anCols.some((k) => typeof an[k] !== "number" || an[k] < 1 || an[k] > 5);
        const agIncomplete = !ag || agCols.some((k) => typeof ag[k] !== "number" || ag[k] < 1 || ag[k] > 5);

        if (anIncomplete) setTarget("/onboarding/always-never");
        else if (agIncomplete) setTarget("/onboarding/agree-disagree");
        else setTarget("/dashboard");
      } catch (e: any) {
        console.error(e);
        toast({ title: "Error", description: e.message ?? "Could not determine onboarding step.", variant: "destructive" as any });
        setTarget("/dashboard");
      }
    };
    check();
  }, [toast]);

  if (!target) {
    return (
      <main className="container py-10">
        <SEO title="Onboarding" description="Continue your onboarding questionnaire." />
        <div className="h-6 w-28 animate-pulse rounded bg-muted" />
      </main>
    );
  }

  return <Navigate to={target} replace />;
};

export default OnboardingIndex;
