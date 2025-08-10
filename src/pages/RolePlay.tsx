import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const RolePlay: React.FC = () => {
  return (
    <div className="container py-10">
      <SEO
        title="Role-Play Simulator – Stoic Coach"
        description="Practice tough conversations and get feedback from your AI coach."
      />

      <h1 className="text-3xl font-bold tracking-tight">Role-Play Simulator</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feedback">Ask for Feedback</SelectItem>
                <SelectItem value="boundary">Set a Boundary</SelectItem>
                <SelectItem value="negotiate">Negotiate a Raise</SelectItem>
              </SelectContent>
            </Select>
            <div className="rounded-md border h-72 p-4 text-sm text-muted-foreground">
              Conversation will appear here.
            </div>
            <div className="flex gap-2">
              <Input placeholder="Type your response…" />
              <Button>Send</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              You'll receive actionable guidance on tone, clarity, and courage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RolePlay;
