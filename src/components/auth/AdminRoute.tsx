import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminRoute: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
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
      } finally {
        setInitializing(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session;
      setIsAuthed(authed);
      if (authed && session?.user?.id) {
        fetchAdmin(session.user.id);
      } else {
        setIsAdmin(false);
        setInitializing(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const authed = !!session;
      setIsAuthed(authed);
      if (authed && session?.user?.id) {
        fetchAdmin(session.user.id);
      } else {
        setIsAdmin(false);
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <div className="container py-16">
        <div className="h-6 w-28 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
