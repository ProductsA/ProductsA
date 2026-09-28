"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <PageTitle pageName="Page Non Trouvee" />
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-muted-foreground/20 mb-4">404</div>
        <h1 className="text-3xl font-bold tracking-tight">Page non trouvee</h1>
        <p className="text-muted-foreground mt-3">
          La page que vous recherchez n&apos;existe pas, a ete deplacee ou est temporairement indisponible.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <Button onClick={() => window.history.back()} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}
