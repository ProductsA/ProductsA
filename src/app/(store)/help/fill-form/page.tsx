import Link from "next/link";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Remplissez le Formulaire` };
}

export default function FillFormPage() {
  return (
    <div>
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-3">Remplissez le formulaire</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
          Une fois votre produit choisi, vous devez remplir un formulaire rapide avec vos informations.
        </p>
      </ScrollReveal>

      <div className="space-y-8">
        <ScrollReveal delay={100}>
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-lg font-semibold mb-4">Que devez-vous remplir ?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Le formulaire vous demande simplement les informations necessaires pour livrer votre commande :
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                <div>
                  <strong className="text-foreground">Prenom et nom</strong>
                  <p className="mt-0.5">Pour savoir a qui nous livrons la commande.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                <div>
                  <strong className="text-foreground">Telephone</strong>
                  <p className="mt-0.5">Pour vous contacter en cas de besoin et confirmer la livraison.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                <div>
                  <strong className="text-foreground">Email</strong>
                  <p className="mt-0.5">Pour recevoir une confirmation de votre commande par email.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">4</span>
                <div>
                  <strong className="text-foreground">Adresse de livraison</strong>
                  <p className="mt-0.5">L&apos;adresse complete ou nous devons livrer votre commande (rue, ville, code postal).</p>
                </div>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-lg font-semibold mb-4">Comment ca marche ?</h2>
            <ol className="space-y-4 text-sm text-muted-foreground list-decimal list-inside">
              <li className="leading-relaxed">
                Sur la page du produit, cliquez sur <strong className="text-foreground">&quot;Commander maintenant&quot;</strong>.
              </li>
              <li className="leading-relaxed">
                Le formulaire s&apos;affiche avec les champs a remplir.
              </li>
              <li className="leading-relaxed">
                Remplissez les champs obligatoires (marques d&apos;astherisque).
              </li>
              <li className="leading-relaxed">
                Si le produit a des variations (taille, couleur...), selectionnez vos options.
              </li>
              <li className="leading-relaxed">
                Cliquez sur <strong className="text-foreground">&quot;Envoyer la demande&quot;</strong>.
              </li>
              <li className="leading-relaxed">
                Vous recevez un <strong className="text-foreground">numero de reference</strong> (REQ-...). Gardez-le precieusement !
              </li>
            </ol>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Astuce :</strong> Vos informations sont sauvegardees. La prochaine fois que vous commandez, vous n&apos;aurez pas tout recommencer !
            </p>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={400}>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/help/receive-order"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Etape suivante : recevoir la commande <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/help/choose-product"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition-all"
          >
            Retour : choisir un produit
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
