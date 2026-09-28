import Link from "next/link";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import { ShoppingBag, ClipboardList, Truck, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Comment Commander` };
}

export default function HowToOrderPage() {
  const steps = [
    {
      icon: ShoppingBag,
      number: "1",
      title: "Choisissez un produit",
      description: "Parcourez notre catalogue et cliquez sur le produit qui vous interesse.",
      link: "/help/choose-product",
      linkText: "En savoir plus",
    },
    {
      icon: ClipboardList,
      number: "2",
      title: "Remplissez le formulaire",
      description: "Entrez vos informations (nom, telephone, adresse) pour passer votre commande.",
      link: "/help/fill-form",
      linkText: "En savoir plus",
    },
    {
      icon: Truck,
      number: "3",
      title: "Recevez votre commande",
      description: "Nous livrons votre commande directement chez vous. Vous payez a la reception.",
      link: "/help/receive-order",
      linkText: "En savoir plus",
    },
  ];

  return (
    <div>
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-3">Comment commander ?</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
          Commander sur notre boutique est simple et rapide. Voici les 3 etapes a suivre :
        </p>
      </ScrollReveal>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <ScrollReveal key={step.number} delay={i * 100}>
            <div className="rounded-2xl border bg-card p-8 flex items-start gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                  Etape {step.number}
                </div>
                <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                <Link
                  href={step.link}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3 hover:underline"
                >
                  {step.linkText} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={300}>
        <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/10 p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">C&apos;est tout !</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            En 3 etapes simples, vous passez votre commande et la recevez chez vous.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Commencer mes achats
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
