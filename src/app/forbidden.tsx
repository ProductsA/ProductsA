import Link from "next/link";
import { ShieldX } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Acces Interdit` };
}

export default function Forbidden() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <ShieldX className="h-16 w-16 text-destructive/40 mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">Acces interdit</h1>
        <p className="text-muted-foreground mt-3">
          Vous n&apos;avez pas les autorisations necessaires pour acceder a cette page.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Retour a l&apos;accueil
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Connexion admin
          </Link>
        </div>
      </div>
    </div>
  );
}
