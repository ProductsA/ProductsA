"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Globe, ExternalLink, Info, CheckCircle2, Circle } from "lucide-react";
import { updateSettings, getSettings } from "@/app/admin/settings/actions";
import { PageTitle } from "@/components/PageTitle";

export default function DomainSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [subdomain, setSubdomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [domainVerified, setDomainVerified] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setSubdomain(settings.domain_subdomain || "");
        setCustomDomain(settings.domain_custom || "");
        setDomainVerified(settings.domain_verified === "true");
      } catch {
        toast("Failed to load domain settings", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    const data: Record<string, string> = {
      domain_subdomain: subdomain,
      domain_custom: customDomain,
    };
    const result = await updateSettings(data);
    if (result.success) toast("Domain settings saved", "success");
    else toast(result.error || "Failed to save", "error");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Domain Settings</h1>
        <div className="text-muted-foreground">Loading domain settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle pageName="Domaine" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Domain Settings</h1>
          <p className="text-muted-foreground">Configure your store domain and subdomain</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" /> Save Domain Settings
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> Current Domain
            </CardTitle>
            <CardDescription>Your store&apos;s active domain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground mb-1">Active URL</p>
              <p className="font-mono text-sm font-medium flex items-center gap-2">
                {typeof window !== "undefined" ? window.location.host : "store.example.com"}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </p>
            </div>
            <div className="flex items-center gap-2">
              {domainVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">Domain verified</span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Domain not yet verified</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subdomain</CardTitle>
            <CardDescription>Choose a subdomain for your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Desired Subdomain</label>
              <div className="flex items-center gap-2">
                <Input
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="my-store"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.example.com</span>
              </div>
              {subdomain && (
                <p className="text-xs text-muted-foreground mt-1">
                  Your store URL: <span className="font-mono">{subdomain}.example.com</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Domain</CardTitle>
            <CardDescription>Use your own domain name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Custom Domain</label>
              <Input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="www.yourdomain.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" /> DNS Configuration
            </CardTitle>
            <CardDescription>Instructions for pointing your domain to this store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <p className="text-sm font-medium">To use a custom domain, add these DNS records:</p>
              <div className="rounded border bg-background p-3 font-mono text-xs space-y-1">
                <p>Type: <span className="font-medium">CNAME</span></p>
                <p>Name: <span className="font-medium">@</span> or <span className="font-medium">www</span></p>
                <p>Value: <span className="font-medium">cname.example.com</span></p>
              </div>
              <p className="text-sm text-muted-foreground">
                After updating DNS records, verification may take up to 48 hours. Changes are checked periodically.
              </p>
            </div>
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Domain and DNS configuration requires server-side setup that is not yet fully implemented.
                  The settings above will be saved and ready for when DNS integration is available.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
