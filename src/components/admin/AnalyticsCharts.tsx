"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Package,
  CheckCircle,
  EyeOff,
  Users,
  Clock,
  Phone,
  Check,
  Calendar,
} from "lucide-react";

interface RequestsPerDay {
  date: string;
  count: number;
}

interface RequestsPerProduct {
  product: string;
  count: number;
}

interface AnalyticsData {
  products: { total: number; active: number; hidden: number };
  customers: { total: number; new: number; contacted: number; confirmed: number };
  requests: { total: number; today: number; thisWeek: number; thisMonth: number };
  requestsPerDay: RequestsPerDay[];
  requestsPerProduct: RequestsPerProduct[];
  mostRequestedProduct: RequestsPerProduct | null;
  conversion: { rate: string; new: number; confirmed: number };
  recentActivity: {
    id: number;
    customer: string;
    product: string;
    status: string;
    date: string;
  }[];
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-background shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Completed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Rejected: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg border bg-background shadow-sm animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-lg border bg-background shadow-sm animate-pulse" />
        <div className="h-80 rounded-lg border bg-background shadow-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into your store performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={data.products.total}
          icon={<Package className="h-5 w-5" />}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Active Products"
          value={data.products.active}
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Hidden Products"
          value={data.products.hidden}
          icon={<EyeOff className="h-5 w-5" />}
          color="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          label="Total Customers"
          value={data.customers.total}
          icon={<Users className="h-5 w-5" />}
          color="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="New Requests"
          value={data.customers.new}
          icon={<Clock className="h-5 w-5" />}
          color="text-cyan-600 dark:text-cyan-400"
        />
        <StatCard
          label="Contacted"
          value={data.customers.contacted}
          icon={<Phone className="h-5 w-5" />}
          color="text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          label="Confirmed"
          value={data.customers.confirmed}
          icon={<Check className="h-5 w-5" />}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Requests Today"
          value={data.requests.today}
          icon={<Calendar className="h-5 w-5" />}
          color="text-rose-600 dark:text-rose-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-background shadow-sm p-6">
          <span className="text-sm font-medium text-muted-foreground">This Week</span>
          <div className="text-3xl font-bold mt-1">{data.requests.thisWeek}</div>
          <p className="text-xs text-muted-foreground mt-1">requests</p>
        </div>
        <div className="rounded-lg border bg-background shadow-sm p-6">
          <span className="text-sm font-medium text-muted-foreground">This Month</span>
          <div className="text-3xl font-bold mt-1">{data.requests.thisMonth}</div>
          <p className="text-xs text-muted-foreground mt-1">requests</p>
        </div>
        <div className="rounded-lg border bg-background shadow-sm p-6">
          <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
          <div className="text-3xl font-bold mt-1">{data.conversion.rate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.conversion.confirmed} confirmed / {data.conversion.new} new
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-background shadow-sm p-6">
        <h2 className="text-base font-semibold mb-4">Requests Per Day (Last 30 Days)</h2>
        {data.requestsPerDay.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.requestsPerDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={4}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-background shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">Top 10 Most Requested Products</h2>
          {data.requestsPerProduct.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.requestsPerProduct} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="product"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.requestsPerProduct.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          data.mostRequestedProduct &&
                          entry.product === data.mostRequestedProduct.product
                            ? "hsl(var(--primary))"
                            : "hsl(var(--primary) / 0.5)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
          )}
          {data.mostRequestedProduct && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium text-foreground">Most requested:</span>{" "}
              {data.mostRequestedProduct.product} ({data.mostRequestedProduct.count} requests)
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-background shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">Recent Activity</h2>
          {data.recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{activity.customer}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.product}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <StatusBadge status={activity.status} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
