import Link from "next/link";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import { Search, Eye, Star, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Choisissez un Produit` };
}

export default function ChooseProductPage() {
  return (
    <div>
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-3">Choisissez un produit</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
          La premiere etape consiste a trouver le produit qui vous convient dans notre catalogue.
        </p>
      </ScrollReveal>

      <div className="space-y-8">
        <ScrollReveal delay={100}>
          <div className="rounded-2xl border bg-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Parcourez le catalogue</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Allez sur la page <strong>Produits</strong> pour voir tous nos articles. Vous pouvez filtrer par category ou utiliser la barre de recherche pour trouver un produit specifique.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Utilisez les filtres par category a gauche de la page
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Taper un mot-cle dans la barre de recherche
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Triez par prix ou par date d&apos;ajout
              </li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="rounded-2xl border bg-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Consultez les details</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cliquez sur un produit pour voir sa page detaillee. Vous y trouverez :
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                La description complete du produit
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Les photos du produit sous differents angles
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Le prix et les eventuelles reductions
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Les variations disponibles (taille, couleur, etc.)
              </li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="rounded-2xl border bg-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Star className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Choisissez avec confiance</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Tous nos produits sont soigneusement selectionnes. Si vous avez des questions sur un produit avant de commander, n&apos;hesitez pas a nous contacter par telephone ou email.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={400}>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Voir les produits <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/help/fill-form"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition-all"
          >
            Etape suivante : remplir le formulaire
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
