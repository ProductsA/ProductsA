import Link from "next/link";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Recevez votre Commande` };
}

export default function ReceiveOrderPage() {
  return (
    <div>
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-3">Recevez votre commande</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
          Apres avoir soumis votre demande, voici ce qui se passe ensuite.
        </p>
      </ScrollReveal>

      <div className="space-y-8">
        <ScrollReveal delay={100}>
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-lg font-semibold mb-4">1. Confirmation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Apres avoir envoye votre formulaire, vous recevez un <strong className="text-foreground">numero de reference</strong> (comme REQ-20260818-0001). Un email de confirmation vous est envoye. Conservez ce numero pour suivre votre commande.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-lg font-semibold mb-4">2. Traitement</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Notre equipe traite votre commande et prepare votre produit pour la livraison. Si nous avons des questions, nous vous contacterons par telephone ou email.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Delai habituel : 1 a 3 jours ouvrables
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Nous verifions la qualite du produit avant envoi
              </li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-lg font-semibold mb-4">3. Livraison</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Votre commande est livree directement chez vous. Voici ce qu&apos;il faut savoir :
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">A</span>
                <div>
                  <strong className="text-foreground">Paiement a la livraison</strong>
                  <p className="mt-0.5">Vous payez en especes lors de la reception de votre colis. Aucun paiement en avance n&apos;est necessaire.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">B</span>
                <div>
                  <strong className="text-foreground">Verifiez votre colis</strong>
                  <p className="mt-0.5">Avant de payer, verifiez que le produit correspond a votre commande et qu&apos;il est en bon etat.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">C</span>
                <div>
                  <strong className="text-foreground">Signez le bon de livraison</strong>
                  <p className="mt-0.5">Apres verification, signez pour confirmer la reception.</p>
                </div>
              </li>
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Besoin d&apos;aide ?</strong> Contactez-nous par telephone ou email si vous avez des questions sur votre commande.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={500}>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Voir les produits
          </Link>
          <Link
            href="/help/fill-form"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition-all"
          >
            Retour : remplir le formulaire
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
