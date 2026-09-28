import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { NotificationBell } from "@/components/admin/NotificationBell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    // Don't redirect the login page itself - that causes infinite loops
    // The proxy handles protecting other admin routes
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        admin={{
          name: session.user.name ?? "Admin",
          email: session.user.email ?? "",
        }}
      />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-30 flex items-center justify-end border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-2 lg:px-8">
          <NotificationBell />
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
