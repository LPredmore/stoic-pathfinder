import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Goals: React.FC = () => {
  const goals = [
    {
      id: 1,
      title: "Become a clear communicator",
      progress: 65,
      subgoals: [
        { id: 11, title: "Ask for feedback weekly", progress: 80 },
        { id: 12, title: "Practice role-plays twice", progress: 40 },
      ],
    },
  ];

  return (
    <div className="container py-10">
      <SEO
        title="Goals & Subgoals – Stoic Coach"
        description="Build a hierarchy of goals with progress tracking and smart suggestions."
      />

      <h1 className="text-3xl font-bold tracking-tight">Goals & Subgoals</h1>

      <div className="mt-6 grid gap-6">
        {goals.map((g) => (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle>{g.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{g.progress}%</div>
                </div>
                <ul className="space-y-2">
                  {g.subgoals.map((s) => (
                    <li key={s.id} className="rounded-md border p-3">
                      <div className="font-medium">{s.title}</div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Button variant="secondary">Add Subgoal</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Goals;
