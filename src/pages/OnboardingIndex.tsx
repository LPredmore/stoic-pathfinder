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
        // Ensure profile exists and read onboarding_status
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, onboarding_status")
          .eq("user_id", user.id)
          .maybeSingle();
        let pid = prof?.id as string | undefined;
        let status = (prof as any)?.onboarding_status as 'onboarding' | 'complete' | undefined;
        if (!pid) {
          const { data: newProf, error: insErr } = await supabase
            .from("profiles")
            .insert({ user_id: user.id })
            .select("id, onboarding_status")
            .single();
          if (insErr) throw insErr;
          pid = newProf.id as string;
          status = (newProf as any).onboarding_status as any;
        }

        if (status === "complete") setTarget("/dashboard");
        else setTarget("/onboarding/always-never");
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
