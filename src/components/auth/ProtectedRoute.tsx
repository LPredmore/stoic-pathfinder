import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [nextStep, setNextStep] = useState<"always-never" | "agree-disagree" | null>(null);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only synchronous updates per best practices
      setIsAuthed(!!session);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const authed = !!session;
      setIsAuthed(authed);
      setInitializing(false);
      if (authed) {
        setChecking(true);
        try {
          const userId = session!.user.id;
          // Ensure profile exists
          const { data: prof } = await (supabase
            .from("profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle());
          let pid = prof?.id as string | undefined;
          if (!pid) {
            const { data: newProf, error: insErr } = await (supabase
              .from("profiles")
              .insert({ user_id: userId })
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

          if (anIncomplete) {
            setOnboardingRequired(true);
            setNextStep("always-never");
          } else if (agIncomplete) {
            setOnboardingRequired(true);
            setNextStep("agree-disagree");
          } else {
            setOnboardingRequired(false);
            setNextStep(null);
          }
        } catch (e) {
          console.error("Onboarding check failed", e);
          // Fail-open to dashboard
          setOnboardingRequired(false);
          setNextStep(null);
        } finally {
          setChecking(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing || (isAuthed && checking)) {
    return (
      <div className="container py-16">
        <div className="h-6 w-28 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const onOnboardingRoute = location.pathname.startsWith("/onboarding");
  if (onboardingRequired && !onOnboardingRoute) {
    const step = nextStep ?? "always-never";
    return <Navigate to={`/onboarding/${step}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
