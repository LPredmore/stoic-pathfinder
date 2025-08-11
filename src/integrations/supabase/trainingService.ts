import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export const defaultModes = ["express", "reflect", "guide"] as const;
export type CoachMode = (typeof defaultModes)[number] | string;

type AiTrainingRow = Database["public"]["Tables"]["ai_training"]["Row"];

export async function getModeInstructions(mode: string): Promise<AiTrainingRow | null> {
  const { data, error } = await supabase
    .from("ai_training")
    .select("id, mode, instructions, created_at, updated_at")
    .eq("mode", mode)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as AiTrainingRow) ?? null;
}

export async function saveModeInstructions(mode: string, instructions: string): Promise<string> {
  // Check if a row already exists for this mode
  const { data: existing, error: selError } = await supabase
    .from("ai_training")
    .select("id")
    .eq("mode", mode)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selError) throw selError;

  if (existing?.id) {
    const { error: updError } = await supabase
      .from("ai_training")
      .update({ instructions })
      .eq("id", existing.id);
    if (updError) throw updError;
    return existing.id as string;
  }

  const { data: inserted, error: insError } = await supabase
    .from("ai_training")
    .insert({ mode, instructions })
    .select("id")
    .single();

  if (insError) throw insError;
  return (inserted as { id: string }).id;
}

export function listModes(): string[] {
  return [...defaultModes];
}
