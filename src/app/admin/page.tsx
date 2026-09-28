import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Users,
  MessageSquareText,
  TrendingUp,
  Clock,
  CalendarDays,
} from "lucide-react";
import { RecentRequests } from "@/components/admin/RecentRequests";
import { RequestsChart } from "@/components/admin/RequestsChart";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Tableau de Bord` };
}

export default async function AdminDashboard() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProducts,
    activeProducts,
    totalCustomers,
    newRequests,
    requestsToday,
    requestsThisMonth,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: true } }),
    prisma.customer.count(),
    prisma.customerRequest.count({ where: { status: "New" } }),
    prisma.customerRequest.count({ where: { submittedAt: { gte: todayStart } } }),
    prisma.customerRequest.count({ where: { submittedAt: { gte: monthStart } } }),
  ]);

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "text-primary" },
    { label: "Active Products", value: activeProducts, icon: TrendingUp, color: "text-success" },
    { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-blue-500 dark:text-blue-400" },
    { label: "New Requests", value: newRequests, icon: MessageSquareText, color: "text-warning" },
    { label: "Requests Today", value: requestsToday, icon: Clock, color: "text-cyan-500 dark:text-cyan-400" },
    { label: "This Month", value: requestsThisMonth, icon: CalendarDays, color: "text-rose-500 dark:text-rose-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requests — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentRequests />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
