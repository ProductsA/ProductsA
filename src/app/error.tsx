"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <PageTitle pageName="Erreur" />
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive/40 mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">Une erreur est survenue</h1>
        <p className="text-muted-foreground mt-3">
          {error.message || "Quelque chose s'est mal passe. Veuillez reessayer."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mt-2">Ref: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button onClick={reset}>Reessayer</Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
