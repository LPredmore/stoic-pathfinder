import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
const Settings: React.FC = () => {
  const { toast } = useToast();
  const [admin, setAdmin] = React.useState<boolean | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const uid = session?.user.id;
      if (!uid) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("admin")
        .eq("user_id", uid)
        .maybeSingle();
      if (!error && data) setAdmin(!!(data as any).admin);
    });
  }, []);

  const handleAdminToggle = async (checked: boolean) => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user.id;
    if (!uid) { setSaving(false); return; }
    const { error } = await supabase
      .from("profiles")
      .update({ admin: checked })
      .eq("user_id", uid);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" as any });
    } else {
      setAdmin(checked);
      toast({ title: checked ? "You are now an admin" : "Admin access removed" });
    }
    setSaving(false);
  };

  return (
    <div className="container py-10">
      <SEO
        title="Settings & Profile – Stoic Coach"
        description="Manage account, notifications, and coach intensity preferences."
      />

      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notif">Notifications</Label>
              <Switch id="notif" />
            </div>
            <div className="space-y-2">
              <Label>Coach Intensity</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gentle">Gentle</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="tough">Tough</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Personality snapshots and assessments will appear here once you onboard.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <Label htmlFor="admin">Admin</Label>
              <Switch
                id="admin"
                checked={!!admin}
                disabled={admin === null || saving}
                onCheckedChange={handleAdminToggle}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Toggle admin to access the Training page and manage AI therapist settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
