import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const Settings: React.FC = () => {
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
