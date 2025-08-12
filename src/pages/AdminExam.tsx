import React, { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

// Quiz item model for preview-only rendering
 type QuizItem = {
  id: string;
  prompt: string;
  type: "binary" | "scale" | "text";
  options?: [string, string]; // for binary
  placeholder?: string; // for text
};

const QUIZ: QuizItem[] = [
  { id: "q1", type: "binary", prompt: `Casey walks into a buzzing networking event full of unfamiliar faces. The air is loud with chatter and laughter. If you were Casey, would you:`, options: ["strike up conversations with several strangers", "find a quiet corner to observe"] },
  { id: "q2", type: "scale", prompt: `Casey walks into a buzzing networking event full of unfamiliar faces. The air is loud with chatter and laughter. On a scale of 1–5, how energized or drained would you feel by mingling heavily?` },
  { id: "q3", type: "binary", prompt: `You’re the new team liaison at a busy conference. Would you introduce yourself actively to each table or wait until people come to you?`, options: ["introduce yourself actively to each table", "wait until people come to you"] },
  { id: "q4", type: "binary", prompt: `Taylor finds a bookstore with a section labeled “Experimental Fiction.” The titles are strange but intriguing. Would Taylor pick a book at random to explore or stick to a familiar genre?`, options: ["pick a book at random to explore", "stick to a familiar genre"] },
  { id: "q5", type: "scale", prompt: `Taylor finds a bookstore with a section labeled “Experimental Fiction.” The titles are strange but intriguing. How curious (1–5) would they feel about diving in?` },
  { id: "q6", type: "binary", prompt: `If your imagination were a landscape, is it a winding forest of surprises or a well-tended garden of familiar paths?`, options: ["winding forest of surprises", "well-tended garden of familiar paths"] },
  { id: "q7", type: "binary", prompt: `Jordan’s friend begins debating the ethics of AI and consciousness over coffee. Would you join that abstract debate or steer conversation to weekend plans?`, options: ["join the abstract debate", "steer conversation to weekend plans"] },
  { id: "q8", type: "scale", prompt: `Jordan’s friend begins debating the ethics of AI and consciousness over coffee. Rate from 1–5 how stimulating you’d find the discussion.` },
  { id: "q9", type: "binary", prompt: `Story A: Sam dives deep into philosophical puzzles. Story B: Sam plans concrete weekend activities. Which feels more like you?`, options: ["Story A: dives deep into philosophical puzzles", "Story B: plans concrete weekend activities"] },
  { id: "q10", type: "binary", prompt: `Alex has a big project due next week. Their desk can be either meticulously arranged or covered in sticky notes. Would Alex clean and plan every detail first, or jump in and organize later?`, options: ["clean and plan every detail first", "jump in and organize later"] },
  { id: "q11", type: "scale", prompt: `Alex has a big project due next week. Their desk can be either meticulously arranged or covered in sticky notes. How important (1–5) is that initial planning?` },
  { id: "q12", type: "text", prompt: `Imagine a coworker who never organizes files. How would you coach them to improve their workflow?`, placeholder: "Write your coaching approach..." },
  { id: "q13", type: "binary", prompt: `Riley set a goal to learn guitar in six months but only practices sporadically. Would you keep a strict weekly schedule or play whenever inspiration strikes?`, options: ["keep a strict weekly schedule", "play whenever inspiration strikes"] },
  { id: "q14", type: "scale", prompt: `Riley set a goal to learn guitar in six months but only practices sporadically. Rate your likelihood (1–5) of sticking to a regular practice.` },
  { id: "q15", type: "binary", prompt: `Is your commitment like a steady river that never slows or a fluctuating tide that comes and goes?`, options: ["steady river that never slows", "fluctuating tide that comes and goes"] },
  { id: "q16", type: "binary", prompt: `Jordan notices a small stain on their shirt fifteen minutes before a presentation. Would they spend that time worrying about impressions or quickly change and move on?`, options: ["worry about impressions", "quickly change and move on"] },
  { id: "q17", type: "scale", prompt: `Jordan notices a small stain on their shirt fifteen minutes before a presentation. On a scale of 1–5, how anxious would they feel?` },
  { id: "q18", type: "binary", prompt: `Story A: Pat fixates on small problems. Story B: Pat brushes them off. Which describes you?`, options: ["Story A: fixates on small problems", "Story B: brushes them off"] },
  { id: "q19", type: "binary", prompt: `After missing a flight, Casey either replays every decision repeatedly or reviews what to do next time. Would Casey replay the mistake or brainstorm better plans?`, options: ["replay the mistake", "brainstorm better plans"] },
  { id: "q20", type: "scale", prompt: `After missing a flight, Casey either replays every decision repeatedly or reviews what to do next time. How much (1–5) does each pattern resonate?` },
  { id: "q21", type: "binary", prompt: `You’re advising a friend who missed a deadline. Would you ask them to dissect every step that went wrong or help them draft a new plan?`, options: ["dissect every step that went wrong", "help them draft a new plan"] },
  { id: "q22", type: "binary", prompt: `Taylor finds an extra $20 left in a rented bike’s locker. Would Taylor return it immediately or keep it “just this once”?`, options: ["return it immediately", "keep it “just this once”"] },
  { id: "q23", type: "scale", prompt: `Taylor finds an extra $20 left in a rented bike’s locker. How strongly (1–5) do they believe honesty matters here?` },
  { id: "q24", type: "text", prompt: `How would you advise a teammate who takes small office supplies without asking?`, placeholder: "Share your guidance..." },
  { id: "q25", type: "binary", prompt: `During a meeting, Alex realizes they gave incorrect data. Would Alex admit the mistake on the spot or hope no one notices?`, options: ["admit the mistake on the spot", "hope no one notices"] },
  { id: "q26", type: "scale", prompt: `During a meeting, Alex realizes they gave incorrect data. Rate (1–5) your comfort level with admitting errors publicly.` },
  { id: "q27", type: "binary", prompt: `Story A: Sam quickly says “I was wrong.” Story B: Sam changes the subject. Which feels more like you?`, options: ["Story A: quickly says “I was wrong.”", "Story B: changes the subject"] },
  { id: "q28", type: "binary", prompt: `Riley’s friend breaks down in tears over a personal loss. Would Riley sit quietly and offer a hug or silently listen until asked?`, options: ["sit quietly and offer a hug", "silently listen until asked"] },
  { id: "q29", type: "scale", prompt: `Riley’s friend breaks down in tears over a personal loss. How natural (1–5) is it to express empathy?` },
  { id: "q30", type: "binary", prompt: `If your kindness were a weather pattern, is it a warm, gentle rain or a rare, sudden storm?`, options: ["warm, gentle rain", "rare, sudden storm"] },
  { id: "q31", type: "binary", prompt: `Your roommate plays loud music late. Riley can either speak up or endure. Would Riley voice discomfort or stay quiet to keep peace?`, options: ["voice discomfort", "stay quiet to keep peace"] },
  { id: "q32", type: "scale", prompt: `Your roommate plays loud music late. Riley can either speak up or endure. How likely (1–5) is each?` },
  { id: "q33", type: "binary", prompt: `You’re the team leader and notice in-team tension. Would you address it directly or wait and hope it resolves?`, options: ["address it directly", "wait and hope it resolves"] },
  { id: "q34", type: "scale", prompt: `Jordan often notices their own frustration but misses signs when others are upset. How true (1–5) is it that understanding your own emotions comes easier than others’?` },
  { id: "q35", type: "binary", prompt: `Jordan often notices their own frustration but misses signs when others are upset. Would you ask someone how they’re feeling or guess?`, options: ["ask someone how they’re feeling", "guess"] },
  { id: "q36", type: "text", prompt: `How would you coach someone who says they “just don’t get” others’ emotions?`, placeholder: "Your coaching advice..." },
  { id: "q37", type: "binary", prompt: `Taylor works alongside someone who subtly shifts posture when stressed. Would Taylor pick up on that change immediately or later when asked?`, options: ["pick up on that change immediately", "notice later when asked"] },
  { id: "q38", type: "scale", prompt: `Taylor works alongside someone who subtly shifts posture when stressed. Rate (1–5) your sensitivity to such clues.` },
  { id: "q39", type: "binary", prompt: `Story A: Sam spots unspoken discomfort right away. Story B: Sam only notices when told. Which matches you?`, options: ["Story A: spots unspoken discomfort right away", "Story B: only notices when told"] },
  { id: "q40", type: "binary", prompt: `Riley’s inbox explodes with urgent emails. They can take a short break to breathe or power through. Would Riley pause and practice calming techniques or push on?`, options: ["pause and practice calming techniques", "push on"] },
  { id: "q41", type: "scale", prompt: `Riley’s inbox explodes with urgent emails. They can take a short break to breathe or power through. How effective (1–5) is your self-soothing?` },
  { id: "q42", type: "binary", prompt: `Is your stress response like a gusty wind quickly settling or a hurricane that lingers?`, options: ["gusty wind quickly settling", "hurricane that lingers"] },
  { id: "q43", type: "binary", prompt: `Alex texts a friend and doesn’t get a reply for 2 hours. Would Alex assume the friend is upset or that they’re busy?`, options: ["assume the friend is upset", "assume they’re busy"] },
  { id: "q44", type: "scale", prompt: `Alex texts a friend and doesn’t get a reply for 2 hours. How worried (1–5) are they that the friendship is at risk?` },
  { id: "q45", type: "binary", prompt: `You’re the partner waiting for a call back. Do you trust they’ll respond soon or feel anxious something’s wrong?`, options: ["trust they’ll respond soon", "feel anxious something’s wrong"] },
  { id: "q46", type: "binary", prompt: `Taylor’s partner wants to talk about feelings late at night. Would Taylor welcome the talk or suggest postponing?`, options: ["welcome the talk", "suggest postponing"] },
  { id: "q47", type: "scale", prompt: `Taylor’s partner wants to talk about feelings late at night. Rate (1–5) your comfort with deep emotional closeness.` },
  { id: "q48", type: "binary", prompt: `Story A: Sam leans in for a long emotional conversation. Story B: Sam says, “Let’s talk tomorrow.” Which is you?`, options: ["Story A: leans in for a long emotional conversation", "Story B: says, “Let’s talk tomorrow.”"] },
];

const AdminExam: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [profileId, setProfileId] = useState<string | null>(null);
  const [questionIdByText, setQuestionIdByText] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
          if (profile?.id) {
            setProfileId(profile.id as string);
          }
        }

        const prompts = QUIZ.map((q) => q.prompt);
        const { data: qs } = await supabase
          .from("questions")
          .select("id,text")
          .in("text", prompts);

        const map: Record<string, string> = {};
        (qs || []).forEach((q: any) => {
          map[q.text] = q.id;
        });
        setQuestionIdByText(map);
      } catch (e) {
        console.error("AdminExam init failed:", e);
      }
    })();
  }, []);

  const getQuestionId = (prompt: string) => questionIdByText[prompt];

  const saveTextResponse = async (item: QuizItem, response: string) => {
    try {
      if (!profileId) return;
      const questionId = getQuestionId(item.prompt);
      if (!questionId) return;
      await (supabase as any)
        .from("text_responses")
        .upsert(
          { profile_id: profileId, question_id: questionId, response },
          { onConflict: "profile_id,question_id" }
        );
    } catch (e) {
      console.error("saveTextResponse error:", e);
    }
  };

  const upsertScaleResponse = async (item: QuizItem, value: string) => {
    try {
      if (!profileId) return;
      const questionId = getQuestionId(item.prompt);
      if (!questionId) return;
      const num = parseInt(value, 10);
      const { data: updated, error: updErr } = await supabase
        .from("responses")
        .update({ response_value: num, updated_at: new Date().toISOString() })
        .eq("profile_id", profileId)
        .eq("question_id", questionId)
        .select("id");
      if (updErr) {
        console.error("responses update error:", updErr);
      }
      if (!updated || updated.length === 0) {
        const { error: insErr } = await supabase.from("responses").insert({
          profile_id: profileId,
          question_id: questionId,
          response_value: num,
          source: "admin_exam",
        } as any);
        if (insErr) console.error("responses insert error:", insErr);
      }
    } catch (e) {
      console.error("upsertScaleResponse error:", e);
    }
  };

  const renderControls = (item: QuizItem) => {
    const value = answers[item.id] ?? "";

    if (item.type === "binary" && item.options) {
      const [optA, optB] = item.options;
      return (
        <ToggleGroup
          type="single"
          value={value}
          onValueChange={(v) => {
            if (!v) return;
            setAnswers((prev) => ({ ...prev, [item.id]: v }));
            saveTextResponse(item, v);
          }}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          <ToggleGroupItem value={optA} aria-label={optA} className="justify-start">
            {optA}
          </ToggleGroupItem>
          <ToggleGroupItem value={optB} aria-label={optB} className="justify-start">
            {optB}
          </ToggleGroupItem>
        </ToggleGroup>
      );
    }

    if (item.type === "scale") {
      return (
        <div className="space-y-3">
          <RadioGroup
            value={value}
            onValueChange={(v) => {
              setAnswers((prev) => ({ ...prev, [item.id]: v }));
              upsertScaleResponse(item, v);
            }}
            className="flex items-center gap-4"
          >
            {["1", "2", "3", "4", "5"].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <RadioGroupItem id={`${item.id}-${n}`} value={n} />
                <Label htmlFor={`${item.id}-${n}`}>{n}</Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>5</span>
          </div>
        </div>
      );
    }

    return (
      <Textarea
        value={value}
        onChange={(e) => setAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))}
        onBlur={(e) => saveTextResponse(item, e.target.value)}
        placeholder={item.placeholder || "Type your response..."}
        rows={5}
      />
    );
  };

  return (
    <div className="container py-10">
      <SEO title="Admin Exam Preview | Stoic Coach" description="Full-page preview of all exam prompts with binary, scale, and text responses." />

      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Exam Preview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page displays all prompts as the user would see them on a single page.
        </p>
      </header>

      <main>
        <section aria-label="All prompts" className="grid gap-6">
          {QUIZ.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <h2 className="font-medium leading-relaxed">{item.prompt}</h2>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.type === "binary" && (
                  <p className="text-sm text-muted-foreground">Choose one</p>
                )}
                {item.type === "scale" && (
                  <p className="text-sm text-muted-foreground">Select a value from 1 to 5</p>
                )}
                {item.type === "text" && (
                  <p className="text-sm text-muted-foreground">Open-ended response</p>
                )}
                {renderControls(item)}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
};

export default AdminExam;
