"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Upload, X } from "lucide-react";
import { updateSettings, getSettings } from "./actions";
import { PageTitle } from "@/components/PageTitle";

export default function WebsiteSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [websiteName, setWebsiteName] = useState("");
  const [websiteDescription, setWebsiteDescription] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [youtube, setYoutube] = useState("");
  const [footerText, setFooterText] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setWebsiteName(settings.website_name || "");
        setWebsiteDescription(settings.website_description || "");
        setLogo(settings.logo || null);
        setFavicon(settings.favicon || null);
        setPhone(settings.phone || "");
        setEmail(settings.email || "");
        setAddress(settings.address || "");
        setWhatsapp(settings.whatsapp || "");
        setFacebook(settings.social_facebook || "");
        setInstagram(settings.social_instagram || "");
        setTwitter(settings.social_twitter || "");
        setLinkedin(settings.social_linkedin || "");
        setYoutube(settings.social_youtube || "");
        setFooterText(settings.footer_text || "");
        setMetaTitle(settings.meta_title || "");
        setMetaDescription(settings.meta_description || "");
      } catch {
        toast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setter(data.url);
      else toast(data.error || "Upload failed", "error");
    } catch {
      toast("Upload failed", "error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data: Record<string, string> = {
      website_name: websiteName,
      website_description: websiteDescription,
      phone,
      email,
      address,
      whatsapp,
      social_facebook: facebook,
      social_instagram: instagram,
      social_twitter: twitter,
      social_linkedin: linkedin,
      social_youtube: youtube,
      footer_text: footerText,
      meta_title: metaTitle,
      meta_description: metaDescription,
    };
    if (logo !== null) data.logo = logo;
    if (favicon !== null) data.favicon = favicon;

    const result = await updateSettings(data);
    if (result.success) toast("Settings saved successfully", "success");
    else toast(result.error || "Failed to save settings", "error");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Website Settings</h1>
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle pageName="Parametres" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website Settings</h1>
          <p className="text-muted-foreground">Configure your store details and information</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" /> Save Settings
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic store information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Website Name</label>
              <Input value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} placeholder="My Store" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Website Description</label>
              <Textarea value={websiteDescription} onChange={(e) => setWebsiteDescription(e.target.value)} placeholder="A brief description of your store" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Logo</label>
              {logo ? (
                <div className="relative inline-block">
                  <img src={logo} alt="Logo" className="h-16 object-contain border rounded p-1" />
                  <button type="button" onClick={() => setLogo(null)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background border flex items-center justify-center hover:bg-muted">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setLogo)} className="hidden" />
                  <Upload className="h-4 w-4" /> Upload logo
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Favicon</label>
              {favicon ? (
                <div className="relative inline-block">
                  <img src={favicon} alt="Favicon" className="h-10 w-10 object-contain border rounded p-1" />
                  <button type="button" onClick={() => setFavicon(null)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background border flex items-center justify-center hover:bg-muted">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setFavicon)} className="hidden" />
                  <Upload className="h-4 w-4" /> Upload favicon
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How customers can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 600 000 000" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@store.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Physical Address</label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Store St, City, Country" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">WhatsApp Number</label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+212 600 000 000" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Your social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Facebook</label>
              <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/yourpage" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Instagram</label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/yourpage" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Twitter / X</label>
              <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/yourhandle" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">LinkedIn</label>
              <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/company/yours" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">YouTube</label>
              <Input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/@yourchannel" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Footer & SEO</CardTitle>
            <CardDescription>Footer text and search engine metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Footer Text</label>
              <Textarea value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="© 2026 My Store. All rights reserved." rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meta Title</label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="My Store - Best Products Online" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meta Description</label>
              <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="A short description for search engines (150-160 characters recommended)" rows={3} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
