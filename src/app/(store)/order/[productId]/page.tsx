"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { CheckCircle, ArrowLeft, Hash, ShoppingBag } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

function getDeviceId(): string {
  let id = localStorage.getItem("store_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("store_device_id", id);
  }
  return id;
}

interface ProductData {
  id: number;
  name: string;
  slug: string;
  variations: { id: number; variationName: string; variationValue: string }[];
}

interface CustomFieldData {
  id: number;
  fieldName: string;
  fieldType: string;
  required: boolean;
  options?: string | null;
  placeholder?: string | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function OrderPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [requestId, setRequestId] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
  });

  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);
  const [customValues, setCustomValues] = useState<Record<number, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, cfRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/custom-fields`),
        ]);
        if (prodRes.ok) {
          const p = await prodRes.json();
          setProduct(p);
        }
        if (cfRes.ok) {
          const cf = await cfRes.json();
          setCustomFields(cf);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [productId]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "Le prenom est requis";
    if (!form.email.trim()) e.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    if (!form.phone.trim()) e.phone = "Le telephone est requis";
    if (!form.address.trim()) e.address = "L'adresse est requise";

    if (product?.variations.length && selectedVariations.length === 0) {
      e.variation = "Veuillez selectionner au moins une variation";
    }

    for (const cf of customFields) {
      if (cf.required && !customValues[cf.id]?.trim()) {
        e[`custom_${cf.id}`] = `${cf.fieldName} est requis`;
      }
    }

    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName || undefined,
          gender: form.gender || undefined,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city || undefined,
          region: form.region || undefined,
          postalCode: form.postalCode || undefined,
          country: form.country || undefined,
          deviceId: getDeviceId(),
          productId: parseInt(productId, 10),
          variation: selectedVariations.join(", "),
          customFieldValues: Object.entries(customValues)
            .filter(([, v]) => v.trim())
            .map(([fieldId, value]) => ({
              fieldId: parseInt(fieldId, 10),
              value,
            })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Une erreur est survenue");
      } else {
        setRequestId(data.requestId);
        setSubmitted(true);
      }
    } catch {
      setSubmitError("Erreur de connexion. Veuillez reessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const variationOptions =
    product?.variations.map((v) => ({
      value: `${v.variationName}: ${v.variationValue}`,
      label: `${v.variationName}: ${v.variationValue}`,
    })) || [];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Produit non trouve.</p>
        <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Demande envoyee !</h1>
        {requestId && (
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-5 py-2.5 mb-4 text-sm font-mono font-semibold">
            <Hash className="h-4 w-4 text-primary" />
            {requestId}
          </div>
        )}
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Merci {form.firstName}, votre demande pour <strong>{product.name}</strong> a ete soumise avec succes.
          Conservez votre numero de reference pour le suivi.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <PageTitle pageName="Commander" />
      <Link href={`/products/${product.slug}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Retour au produit
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold">Passer une commande</h1>
      </div>
      <p className="text-muted-foreground mb-8 ml-[52px]">
        Produit: <strong>{product.name}</strong>
      </p>

      {submitError && (
        <div className="mb-6 rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Prenom *</label>
            <Input
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              error={errors.firstName}
              placeholder="Jean"
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Nom</label>
            <Input
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Dupont"
              className="rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Genre</label>
          <select
            value={form.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Non specifie</option>
            <option value="Male">Homme</option>
            <option value="Female">Femme</option>
            <option value="Other">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Email *</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={errors.email}
            placeholder="jean@example.com"
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Telephone *</label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            error={errors.phone}
            placeholder="+212 600 000 000"
            className="rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Adresse *</label>
          <Input
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            error={errors.address}
            placeholder="123 Rue Principale"
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Ville</label>
            <Input
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Casablanca"
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Region</label>
            <Input
              value={form.region}
              onChange={(e) => updateField("region", e.target.value)}
              placeholder="Casablanca-Settat"
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Code postal</label>
            <Input
              value={form.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              placeholder="20000"
              className="rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Pays</label>
            <Input
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
              placeholder="Maroc"
              className="rounded-xl"
            />
          </div>
        </div>

        {product.variations.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1.5">Selectionnez vos options *</label>
            <MultiSelect
              options={variationOptions}
              value={selectedVariations}
              onChange={(val) => {
                setSelectedVariations(val);
                if (errors.variation) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.variation;
                    return next;
                  });
                }
              }}
              placeholder="Selectionnez les variations..."
              error={errors.variation}
              required
            />
          </div>
        )}

        {customFields.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-4">Informations supplementaires</h2>
            <div className="space-y-4">
              {customFields.map((cf) => (
                <div key={cf.id}>
                  <label className="block text-sm font-medium mb-1.5">
                    {cf.fieldName} {cf.required && "*"}
                  </label>
                  {cf.fieldType === "select" && cf.options ? (
                    <select
                      value={customValues[cf.id] || ""}
                      onChange={(e) => {
                        setCustomValues((prev) => ({ ...prev, [cf.id]: e.target.value }));
                        if (errors[`custom_${cf.id}`]) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next[`custom_${cf.id}`];
                            return next;
                          });
                        }
                      }}
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selectionnez...</option>
                      {cf.options.split(",").map((opt) => (
                        <option key={opt.trim()} value={opt.trim()}>
                          {opt.trim()}
                        </option>
                      ))}
                    </select>
                  ) : cf.fieldType === "textarea" ? (
                    <textarea
                      value={customValues[cf.id] || ""}
                      onChange={(e) => {
                        setCustomValues((prev) => ({ ...prev, [cf.id]: e.target.value }));
                        if (errors[`custom_${cf.id}`]) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next[`custom_${cf.id}`];
                            return next;
                          });
                        }
                      }}
                      placeholder={cf.placeholder || ""}
                      className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  ) : (
                    <Input
                      type={cf.fieldType === "number" ? "number" : cf.fieldType === "email" ? "email" : "text"}
                      value={customValues[cf.id] || ""}
                      onChange={(e) => {
                        setCustomValues((prev) => ({ ...prev, [cf.id]: e.target.value }));
                        if (errors[`custom_${cf.id}`]) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next[`custom_${cf.id}`];
                            return next;
                          });
                        }
                      }}
                      placeholder={cf.placeholder || ""}
                      className="rounded-xl"
                    />
                  )}
                  {errors[`custom_${cf.id}`] && (
                    <p className="mt-1.5 text-sm text-destructive">{errors[`custom_${cf.id}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" loading={submitting} className="w-full rounded-xl" size="lg">
          Envoyer la demande
        </Button>
      </form>
    </div>
  );
}
