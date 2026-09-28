import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";

export default function StoreNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <PageTitle pageName="Page Non Trouvee" />
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
        <span className="text-3xl font-bold text-muted-foreground">404</span>
      </div>
      <h1 className="text-3xl font-bold mb-2">Page non trouvee</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        La page que vous recherchez n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary/90 transition-all"
      >
        Retour a l&apos;accueil
      </Link>
    </div>
  );
}
