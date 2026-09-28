import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Analytique` };
}

export default function AnalyticsPage() {
  return <AnalyticsCharts />;
}
