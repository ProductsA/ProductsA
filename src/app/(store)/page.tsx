import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { serialize } from "@/lib/utils";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import {
  ArrowRight,
  Shield,
  Truck,
  Clock,
  Star,
  ChevronDown,
  Package,
  Headphones,
  CreditCard,
} from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Accueil` };
}

export default async function StoreHome() {
  const [featuredProducts, newProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isVisible: true, featured: true },
      take: 4,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variations: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isVisible: true },
      take: 8,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variations: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: { where: { isVisible: true } } } },
      },
    }),
  ]);

  const features = [
    {
      icon: Shield,
      title: "Qualite Guaranteee",
      description: "Tous nos produits sont soigneusement selectionnes pour vous garantir la meilleure qualite.",
    },
    {
      icon: Truck,
      title: "Livraison Rapide",
      description: "Livraison a domicile dans tout le Maroc. Recevez vos commandes en toute rapidite.",
    },
    {
      icon: Headphones,
      title: "Support 24/7",
      description: "Notre equipe est disponible pour repondre a toutes vos questions a tout moment.",
    },
    {
      icon: CreditCard,
      title: "Paiement Securise",
      description: "Paiement a la livraison. Vous payez uniquementwhen vous recevez votre commande.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Choisissez",
      description: "Parcourez notre catalogue et trouvez le produit qui vous convient.",
      icon: Package,
    },
    {
      number: "02",
      title: "Commandez",
      description: "Remplissez le formulaire de commande en quelques clics.",
      icon: CreditCard,
    },
    {
      number: "03",
      title: "Recevez",
      description: "Recevez votre commande directement chez vous.",
      icon: Truck,
    },
  ];

  const testimonials = [
    {
      name: "Fatima Zahra",
      location: "Casablanca",
      text: "Produits de tres bonne qualite et livraison tres rapide. Je recommande vivement cette boutique !",
      rating: 5,
    },
    {
      name: "Mohammed Alami",
      location: "Rabat",
      text: "Excellent service client. Mon probleme a ete resolu tres rapidement. Merci !",
      rating: 5,
    },
    {
      name: "Sara Bennani",
      location: "Marrakech",
      text: "J'achete regulierement ici. Les prix sont tres competitifs et la qualite est toujours au rendez-vous.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Comment puis-je passer une commande ?",
      answer: "Choisissez un produit, cliquez sur Commander, remplissez le formulaire avec vos informations et envoyez votre demande. Vous recevrez une confirmation par email.",
    },
    {
      question: "Quels sont les delais de livraison ?",
      answer: "La livraison prend generalement 2-5 jours ouvrables selon votre localisation au Maroc.",
    },
    {
      question: "Puis-je modifier ma commande ?",
      answer: "Oui, contactez-nous dans les 24 heures suivant votre commande pour toute modification.",
    },
    {
      question: "Quels sont les moyens de paiement acceptes ?",
      answer: "Nous acceptons le paiement a la livraison (especes) et le virement bancaire.",
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Star className="h-3.5 w-3.5 fill-primary" />
              Qualite premium au Maroc
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance animate-slide-up">
              Decouvrez nos{" "}
              <span className="gradient-text">produits d&apos;exception</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl animate-slide-up" style={{ animationDelay: "100ms" }}>
              Parcourez notre catalogue et trouvez ce qu&apos;il vous faut. Qualite garantie, livraison rapide, service client dedicate.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
              >
                Voir les produits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-3.5 text-sm font-medium hover:bg-secondary transition-all duration-200"
              >
                Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 100}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{f.title}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block truncate">{f.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold">Produits en vedette</h2>
                <p className="text-muted-foreground mt-2">Notre selection de produits les plus populaires</p>
              </div>
              <Link href="/products" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serialize(featuredProducts).map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 100}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <ScrollReveal>
              <h2 className="text-3xl font-bold mb-10 text-center">Nos Categories</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, i) => (
                <ScrollReveal key={cat.id} delay={i * 80}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="group block rounded-2xl border bg-card p-8 card-hover"
                  >
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{cat.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-4">
                      {cat._count.products} produit{cat._count.products !== 1 ? "s" : ""}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Explorer <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Comment ca marche ?</h2>
            <p className="text-muted-foreground mt-2">Commandez en 3 etapes simples</p>
          </div>
        </ScrollReveal>
        <div className="hidden md:flex items-center justify-center gap-4">
          {steps.flatMap((step, i) => [
            <ScrollReveal key={step.number} delay={i * 150}>
              <div className="text-center p-8 rounded-2xl border bg-card h-full flex flex-col items-center w-72 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                  Etape {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </ScrollReveal>,
            i < steps.length - 1 ? (
              <div key={`arrow-${i}`} className="flex items-center text-muted-foreground/40 shrink-0">
                <ArrowRight className="h-5 w-5" />
              </div>
            ) : null,
          ])}
        </div>
        <div className="md:hidden space-y-6">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 150}>
              <div className="text-center p-8 rounded-2xl border bg-card flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                  Etape {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="mt-6 text-muted-foreground/30 rotate-90">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold">Nouveaux produits</h2>
                  <p className="text-muted-foreground mt-2">Decouvrez nos dernieres arrivees</p>
                </div>
                <Link href="/products?sort=newest" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0">
                  Voir tout <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serialize(newProducts).slice(0, 4).map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 100}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Ce que disent nos clients</h2>
            <p className="text-muted-foreground mt-2">La satisfaction de nos clients est notre priorite</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 100}>
              <div className="rounded-2xl border bg-card p-8 h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground flex-1 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 pt-4 border-t">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold">Questions frequentes</h2>
              <p className="text-muted-foreground mt-2">Trouvez rapidement les reponses a vos questions</p>
            </div>
          </ScrollReveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={faq.question} delay={i * 80}>
                <details className="group rounded-2xl border bg-card overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-sm select-none hover:bg-muted/50 transition-colors">
                    {faq.question}
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t pt-4">
                    {faq.answer}
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal>
          <div className="relative rounded-3xl bg-primary text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-foreground/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-foreground/5 rounded-full blur-2xl" />
            </div>
            <div className="relative px-8 py-16 md:px-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pret a decouvrir nos produits ?
              </h2>
              <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
                Parcourez notre catalogue et trouvez exactement ce que vous cherchez. Qualite premium, prix competitifs.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-background text-foreground px-8 py-3.5 text-sm font-medium hover:bg-background/90 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
                Voir les produits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
