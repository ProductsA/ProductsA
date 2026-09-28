import { prisma } from "@/lib/prisma";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settingsRaw, admin] = await Promise.all([
    prisma.websiteSetting.findMany(),
    prisma.admin.findFirst({
      select: { name: true, email: true, phone: true },
      orderBy: { id: "asc" },
    }),
  ]);

  const settings: Record<string, string> = {};
  for (const s of settingsRaw) {
    settings[s.key] = s.value || "";
  }

  const siteName = settings.website_name || settings.siteName || settings.storeName || settings.name || "Souq";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header siteName={siteName} />
      <main className="flex-1">{children}</main>
      <Footer
        siteName={siteName}
        settings={settings}
        adminEmail={admin?.email || null}
        adminPhone={admin?.phone || null}
      />
    </div>
  );
}
