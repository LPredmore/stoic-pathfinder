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
          // Ensure profile exists and get onboarding_status
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, onboarding_status")
            .eq("user_id", userId)
            .maybeSingle();

          let pid = prof?.id as string | undefined;
          let status = (prof as any)?.onboarding_status as 'onboarding' | 'complete' | undefined;

          if (!pid) {
            const { data: newProf, error: insErr } = await supabase
              .from("profiles")
              .insert({ user_id: userId })
              .select("id, onboarding_status")
              .single();
            if (insErr) throw insErr;
            pid = newProf.id as string;
            status = (newProf as any).onboarding_status as any;
          }

          if (status === "complete") {
            setOnboardingRequired(false);
            setNextStep(null);
          } else {
            setOnboardingRequired(true);
            setNextStep("always-never");
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
