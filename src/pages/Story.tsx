import React from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Story: React.FC = () => {
  const structured = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Modern Stoic Vignette",
    author: {
      "@type": "Organization",
      name: "Stoic Accountability Coach",
    },
  };

  return (
    <div className="container py-10">
      <SEO
        title="Story of the Day – Stoic Coach"
        description="A modernized stoic vignette tied to your goals with a reflection prompt."
        structuredData={structured}
      />

      <h1 className="text-3xl font-bold tracking-tight">Story of the Day</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>"The Calm within the Calendar"</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Marcus checked his calendar and felt the familiar pull of overwhelm. He paused, breathed,
            and chose one task worthy of his full attention. The rest he left to time.
          </p>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="font-medium">Reflection</p>
            <p className="text-muted-foreground text-sm mt-1">
              How might this apply to your current challenge? What is the single action today that
              would make other tasks easier or unnecessary?
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Story;
