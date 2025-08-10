import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Training: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [settingId, setSettingId] = React.useState<string | null>(null);
  const [profileId, setProfileId] = React.useState<string | null>(null);

  const [persona, setPersona] = React.useState("");
  const [responseStyle, setResponseStyle] = React.useState<string>("");
  const [principles, setPrinciples] = React.useState<string[]>([]);
  const [principleInput, setPrincipleInput] = React.useState("");
  const [safetyBoundaries, setSafetyBoundaries] = React.useState("");
  const [prohibitedTopics, setProhibitedTopics] = React.useState("");
  const [escalationPolicy, setEscalationPolicy] = React.useState("");
  const [sessionOpening, setSessionOpening] = React.useState("");
  const [sessionClosing, setSessionClosing] = React.useState("");
  const [customTools, setCustomTools] = React.useState<string>("{}");
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user.id;
        if (!uid) { setLoading(false); return; }

        const { data: prof } = await supabase
          .from("profiles")
          .select("id, admin")
          .eq("user_id", uid)
          .maybeSingle();
        const pid = (prof as any)?.id as string | undefined;
        setProfileId(pid ?? null);

        const { data: existing } = await supabase
          .from("ai_therapist_settings")
          .select("id, persona, response_style, principles, safety_boundaries, prohibited_topics, escalation_policy, session_opening, session_closing, custom_tools, is_active")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          setSettingId((existing as any).id);
          setPersona((existing as any).persona ?? "");
          setResponseStyle((existing as any).response_style ?? "");
          setPrinciples(((existing as any).principles as string[]) ?? []);
          setSafetyBoundaries((existing as any).safety_boundaries ?? "");
          setProhibitedTopics((existing as any).prohibited_topics ?? "");
          setEscalationPolicy((existing as any).escalation_policy ?? "");
          setSessionOpening((existing as any).session_opening ?? "");
          setSessionClosing((existing as any).session_closing ?? "");
          setCustomTools(JSON.stringify((existing as any).custom_tools ?? {}, null, 2));
          setIsActive(!!(existing as any).is_active);
        }
      } catch (e: any) {
        toast({ title: "Failed to load settings", description: e.message, variant: "destructive" as any });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const addPrinciple = () => {
    const v = principleInput.trim();
    if (!v) return;
    setPrinciples((prev) => Array.from(new Set([...prev, v])));
    setPrincipleInput("");
  };
  const removePrinciple = (p: string) => setPrinciples((prev) => prev.filter((x) => x !== p));

  const handleSave = async () => {
    setSaving(true);
    try {
      let toolsObj: any = {};
      try {
        toolsObj = customTools ? JSON.parse(customTools) : {};
      } catch (e) {
        toast({ title: "Invalid JSON in Custom Tools", description: "Please provide valid JSON.", variant: "destructive" as any });
        setSaving(false);
        return;
      }

      const payload: any = {
        persona: persona || null,
        response_style: responseStyle || null,
        principles: principles,
        safety_boundaries: safetyBoundaries || null,
        prohibited_topics: prohibitedTopics || null,
        escalation_policy: escalationPolicy || null,
        session_opening: sessionOpening || null,
        session_closing: sessionClosing || null,
        custom_tools: toolsObj,
        is_active: isActive,
      };

      if (settingId) {
        const { error } = await supabase
          .from("ai_therapist_settings")
          .update(payload)
          .eq("id", settingId);
        if (error) throw error;
        toast({ title: "Settings updated" });
      } else {
        const { error } = await supabase
          .from("ai_therapist_settings")
          .insert({ ...payload, created_by_profile: profileId })
          .select("id")
          .single();
        if (error) throw error;
        toast({ title: "Settings created" });
      }
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16">
        <div className="h-6 w-28 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <SEO
        title="AI Therapist Training – Admin"
        description="Configure persona, principles, safety boundaries, and interaction style for your AI therapist."
      />
      <h1 className="text-3xl font-bold tracking-tight">AI Therapist Training</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Persona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="persona">Persona / Personality</Label>
              <Textarea id="persona" value={persona} onChange={(e) => setPersona(e.target.value)} rows={6} />
              <p className="text-xs text-muted-foreground">Define tone, therapeutic approach, values, and boundaries.</p>
            </div>

            <div className="space-y-2">
              <Label>Principles</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a guiding principle (e.g., 'Socratic questioning')"
                  value={principleInput}
                  onChange={(e) => setPrincipleInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPrinciple(); } }}
                />
                <Button type="button" onClick={addPrinciple}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {principles.map((p) => (
                  <span key={p} className="inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-xs">
                    {p}
                    <button className="text-muted-foreground hover:text-foreground" onClick={() => removePrinciple(p)} aria-label={`Remove ${p}`}>
                      ×
                    </button>
                  </span>
                ))}
                {principles.length === 0 && (
                  <p className="text-xs text-muted-foreground">No principles yet. Add a few to guide the model.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Response Style</Label>
              <Select value={responseStyle} onValueChange={setResponseStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                  <SelectItem value="socratic">Socratic</SelectItem>
                  <SelectItem value="cbt-informed">CBT-informed</SelectItem>
                  <SelectItem value="motivational-interviewing">Motivational Interviewing</SelectItem>
                  <SelectItem value="solution-focused">Solution-focused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="safety">Safety Boundaries</Label>
              <Textarea id="safety" value={safetyBoundaries} onChange={(e) => setSafetyBoundaries(e.target.value)} rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topics">Prohibited Topics</Label>
              <Textarea id="topics" value={prohibitedTopics} onChange={(e) => setProhibitedTopics(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escalation">Escalation Policy</Label>
              <Textarea id="escalation" value={escalationPolicy} onChange={(e) => setEscalationPolicy(e.target.value)} rows={5} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Session Scripts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="opening">Session Opening</Label>
              <Textarea id="opening" value={sessionOpening} onChange={(e) => setSessionOpening(e.target.value)} rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing">Session Closing</Label>
              <Textarea id="closing" value={sessionClosing} onChange={(e) => setSessionClosing(e.target.value)} rows={5} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Custom Tools (JSON)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={customTools} onChange={(e) => setCustomTools(e.target.value)} rows={10} />
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Training;
