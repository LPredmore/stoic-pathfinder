import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/role-play", label: "Role-Play" },
  { to: "/story", label: "Story" },
  { to: "/goals", label: "Goals" },
  { to: "/settings", label: "Settings" },
];

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
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
