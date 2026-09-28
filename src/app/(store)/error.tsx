"use client";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/PageTitle";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <PageTitle pageName="Erreur" />
      <h1 className="text-6xl font-bold text-destructive/30">!</h1>
      <h2 className="text-2xl font-bold mt-4">Une erreur est survenue</h2>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        {error.message || "Quelque chose s&apos;est mal passe. Veuillez reessayer."}
      </p>
      <Button onClick={reset} className="mt-8">
        Reessayer
      </Button>
    </div>
  );
}
