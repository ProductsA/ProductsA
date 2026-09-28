import Link from "next/link";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Page Non Trouvee` };
}

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6">
        <span className="text-3xl font-bold text-muted-foreground">404</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Page non trouvee</h1>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        La page que vous recherchez n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all"
      >
        Retour au dashboard
      </Link>
    </div>
  );
}
