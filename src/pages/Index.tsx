import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const Index: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Stoic Accountability Coach – AI Coaching App"
        description="Chat, learn, and build discipline with modern stoic lessons, goals, habits, and role‑play simulations."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Stoic Accountability Coach",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
        }}
      />

      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="interactive-spotlight"
      >
        <div className="container py-24 md:py-28">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Build Calm Discipline with an AI Stoic Coach
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Daily lessons, tough-love nudges, and guided role-play to practice
              clear thinking and courageous action.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild variant="premium" size="lg">
                <Link to="/dashboard">Enter Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </header>
        </div>
      </section>

      <section id="features" className="container pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Real-time Coaching</h2>
            <p className="mt-2 text-muted-foreground">
              Chat with your coach and get stoic reframes on the spot.
            </p>
          </article>
          <article className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Goals & Habits</h2>
            <p className="mt-2 text-muted-foreground">
              Set goals, track streaks, and stay accountable.
            </p>
          </article>
          <article className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Role-Play Simulator</h2>
            <p className="mt-2 text-muted-foreground">
              Practice tough conversations with instant feedback.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default Index;
