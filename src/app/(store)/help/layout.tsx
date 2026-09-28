import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <PageTitle pageName="Aide" />
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/help/how-to-order" className="hover:text-foreground transition-colors">Aide</Link>
      </nav>
      {children}
    </div>
  );
}
