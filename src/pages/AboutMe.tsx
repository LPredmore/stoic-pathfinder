import React from "react";
import SEO from "@/components/SEO";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Types
type Goal = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
};

type Boundary = {
  id: string;
  profile_id: string;
  boundary: string;
  created_at: string;
  updated_at: string;
};

const AboutMe: React.FC = () => {
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [profileId, setProfileId] = React.useState<string | null>(null);

  // Goals state
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = React.useState("");
  const [newGoalDescription, setNewGoalDescription] = React.useState("");
  const [newGoalProgress, setNewGoalProgress] = React.useState<number>(0);
  const [editingGoalId, setEditingGoalId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editProgress, setEditProgress] = React.useState<number>(0);

  // Boundaries state
  const [boundaries, setBoundaries] = React.useState<Boundary[]>([]);
  const [newBoundary, setNewBoundary] = React.useState("");
  const [editingBoundaryId, setEditingBoundaryId] = React.useState<string | null>(null);
  const [editBoundary, setEditBoundary] = React.useState("");

  React.useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) {
          setLoading(false);
          return;
        }
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        if (profErr) throw profErr;
        if (!prof) {
          toast({ title: "Profile not found", description: "Please complete onboarding.", variant: "destructive" as any });
          setLoading(false);
          return;
        }
        setProfileId((prof as any).id);

        await Promise.all([loadGoals((prof as any).id), loadBoundaries((prof as any).id)]);
      } catch (e: any) {
        toast({ title: "Error", description: e.message ?? "Failed to load data", variant: "destructive" as any });
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGoals = async (pid: string) => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("profile_id", pid)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load goals", description: error.message, variant: "destructive" as any });
      return;
    }
    setGoals((data as any) as Goal[]);
  };

  const loadBoundaries = async (pid: string) => {
    const { data, error } = await supabase
      .from("boundaries")
      .select("*")
      .eq("profile_id", pid)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load boundaries", description: error.message, variant: "destructive" as any });
      return;
    }
    setBoundaries((data as any) as Boundary[]);
  };

  const addGoal = async () => {
    if (!profileId) return;
    if (!newGoalTitle.trim()) {
      toast({ title: "Title is required", variant: "destructive" as any });
      return;
    }
    const progress = Math.max(0, Math.min(100, Number(newGoalProgress) || 0));
    const { error } = await supabase.from("goals").insert({
      profile_id: profileId,
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim() || null,
      progress,
    });
    if (error) {
      toast({ title: "Failed to add goal", description: error.message, variant: "destructive" as any });
      return;
    }
    setNewGoalTitle("");
    setNewGoalDescription("");
    setNewGoalProgress(0);
    await loadGoals(profileId);
    toast({ title: "Goal added" });
  };

  const startEditGoal = (g: Goal) => {
    setEditingGoalId(g.id);
    setEditTitle(g.title);
    setEditDescription(g.description ?? "");
    setEditProgress(g.progress);
  };

  const saveGoal = async () => {
    if (!profileId || !editingGoalId) return;
    if (!editTitle.trim()) {
      toast({ title: "Title is required", variant: "destructive" as any });
      return;
    }
    const progress = Math.max(0, Math.min(100, Number(editProgress) || 0));
    const { error } = await supabase
      .from("goals")
      .update({ title: editTitle.trim(), description: editDescription.trim() || null, progress })
      .eq("id", editingGoalId);
    if (error) {
      toast({ title: "Failed to update goal", description: error.message, variant: "destructive" as any });
      return;
    }
    setEditingGoalId(null);
    await loadGoals(profileId);
    toast({ title: "Goal updated" });
  };

  const deleteGoal = async (id: string) => {
    if (!profileId) return;
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete goal", description: error.message, variant: "destructive" as any });
      return;
    }
    await loadGoals(profileId);
    toast({ title: "Goal deleted" });
  };

  const addBoundary = async () => {
    if (!profileId) return;
    if (!newBoundary.trim()) {
      toast({ title: "Boundary text is required", variant: "destructive" as any });
      return;
    }
    const { error } = await supabase.from("boundaries").insert({
      profile_id: profileId,
      boundary: newBoundary.trim(),
    });
    if (error) {
      toast({ title: "Failed to add boundary", description: error.message, variant: "destructive" as any });
      return;
    }
    setNewBoundary("");
    await loadBoundaries(profileId);
    toast({ title: "Boundary added" });
  };

  const startEditBoundary = (b: Boundary) => {
    setEditingBoundaryId(b.id);
    setEditBoundary(b.boundary);
  };

  const saveBoundary = async () => {
    if (!profileId || !editingBoundaryId) return;
    if (!editBoundary.trim()) {
      toast({ title: "Boundary text is required", variant: "destructive" as any });
      return;
    }
    const { error } = await supabase
      .from("boundaries")
      .update({ boundary: editBoundary.trim() })
      .eq("id", editingBoundaryId);
    if (error) {
      toast({ title: "Failed to update boundary", description: error.message, variant: "destructive" as any });
      return;
    }
    setEditingBoundaryId(null);
    await loadBoundaries(profileId);
    toast({ title: "Boundary updated" });
  };

  const deleteBoundary = async (id: string) => {
    if (!profileId) return;
    const { error } = await supabase.from("boundaries").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete boundary", description: error.message, variant: "destructive" as any });
      return;
    }
    await loadBoundaries(profileId);
    toast({ title: "Boundary deleted" });
  };

  return (
    <div className="container py-10">
      <SEO
        title="About Me – Stoic Coach"
        description="Manage your personal goals and boundaries in one place."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "About Me",
          description: "Manage your personal goals and boundaries in one place.",
        }}
      />

      <header>
        <h1 className="text-3xl font-bold tracking-tight">About Me</h1>
      </header>

      <main className="mt-6">
        <Tabs defaultValue="goals">
          <TabsList>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="boundaries">Boundaries</TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            <section aria-labelledby="goals-heading" className="mt-4">
              <h2 id="goals-heading" className="sr-only">Goals</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Add a Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Input
                      placeholder="Goal title"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      aria-label="Goal title"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={newGoalProgress}
                      onChange={(e) => setNewGoalProgress(parseInt(e.target.value || "0", 10))}
                      aria-label="Goal progress (0-100)"
                      placeholder="Progress %"
                    />
                    <Button onClick={addGoal}>Add Goal</Button>
                  </div>
                  <div className="mt-3">
                    <Textarea
                      placeholder="Optional description"
                      value={newGoalDescription}
                      onChange={(e) => setNewGoalDescription(e.target.value)}
                      aria-label="Goal description"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 grid gap-3">
                {loading && <div className="text-sm text-muted-foreground">Loading goals…</div>}
                {!loading && goals.length === 0 && (
                  <div className="text-sm text-muted-foreground">No goals yet. Add your first goal above.</div>
                )}
                {goals.map((g) => (
                  <Card key={g.id}>
                    <CardContent className="pt-6">
                      {editingGoalId === g.id ? (
                        <div className="grid gap-3 md:grid-cols-3">
                          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} aria-label="Edit goal title" />
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={editProgress}
                            onChange={(e) => setEditProgress(parseInt(e.target.value || "0", 10))}
                            aria-label="Edit goal progress"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveGoal}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingGoalId(null)}>Cancel</Button>
                          </div>
                          <div className="md:col-span-3">
                            <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} aria-label="Edit goal description" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium">{g.title}</div>
                              {g.description && (
                                <div className="text-sm text-muted-foreground">{g.description}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => startEditGoal(g)}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteGoal(g.id)}>Delete</Button>
                            </div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${g.progress}%` }} />
                          </div>
                          <div className="text-xs text-muted-foreground">{g.progress}%</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="boundaries">
            <section aria-labelledby="boundaries-heading" className="mt-4">
              <h2 id="boundaries-heading" className="sr-only">Boundaries</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Add a Boundary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Input
                      placeholder="Write a personal boundary…"
                      value={newBoundary}
                      onChange={(e) => setNewBoundary(e.target.value)}
                      aria-label="Boundary text"
                    />
                    <Button onClick={addBoundary}>Add Boundary</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 grid gap-3">
                {loading && <div className="text-sm text-muted-foreground">Loading boundaries…</div>}
                {!loading && boundaries.length === 0 && (
                  <div className="text-sm text-muted-foreground">No boundaries yet. Add your first boundary above.</div>
                )}
                {boundaries.map((b) => (
                  <Card key={b.id}>
                    <CardContent className="pt-6">
                      {editingBoundaryId === b.id ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <Input
                            value={editBoundary}
                            onChange={(e) => setEditBoundary(e.target.value)}
                            aria-label="Edit boundary"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveBoundary}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingBoundaryId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm">{b.boundary}</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEditBoundary(b)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteBoundary(b.id)}>Delete</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AboutMe;
