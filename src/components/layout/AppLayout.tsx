import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  
  
  { to: "/about-me", label: "About Me" },
  { to: "/settings", label: "Settings" },
];

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const fetchAdmin = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("admin")
          .eq("user_id", userId)
          .maybeSingle();
        setIsAdmin(!!(data as any)?.admin);
      } catch {
        setIsAdmin(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session;
      setIsAuthed(authed);
      if (authed && session?.user?.id) {
        fetchAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const authed = !!session;
      setIsAuthed(authed);
      if (authed && session?.user?.id) {
        fetchAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Sign out failed", description: error.message, variant: "destructive" as any });
      return;
    }
    toast({ title: "Signed out" });
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-app text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-14 items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[var(--shadow-glow)]" />
            Stoic Coach
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <>
                <NavLink
                  to="/training"
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  Training
                </NavLink>
                <NavLink
                  to="/admin/exam"
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  Admin Exam
                </NavLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAuthed ? (
              <>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="hero" size="sm">
                  <Link to="/dashboard">Open App</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
