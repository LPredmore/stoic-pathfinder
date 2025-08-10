import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const redirectTo = location.state?.from?.pathname || "/dashboard";
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  // Keep session listener to auto-redirect when logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // defer navigation to avoid running inside callback
        setTimeout(() => navigate(redirectTo, { replace: true }), 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" as any });
      return;
    }
    toast({ title: "Welcome back", description: "Redirecting to your dashboard..." });
    navigate(redirectTo, { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" as any });
      return;
    }

    toast({ title: "Check your email", description: "Confirm your address to finish signing up." });
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Login or Create Account – Stoic Accountability Coach"
        description="Sign in or create your account to access your dashboard, goals, and role‑play coach."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Auth – Stoic Accountability Coach",
        }}
      />

      <section className="container py-16 md:py-24">
        <header className="mx-auto max-w-md text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sign in or Create an Account</h1>
          <p className="mt-3 text-muted-foreground">
            Access your stoic lessons, goals, and role‑play simulations.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Use your email and password to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required autoComplete="current-password" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required autoComplete="new-password" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                By continuing, you agree to our terms. Need help? <Link className="underline" to="/">Return home</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Auth;
