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
} from "recharts";

interface DayData {
  date: string;
  count: number;
}

export function RequestsChart() {
  const [data, setData] = useState<DayData[]>([]);

  useEffect(() => {
    fetch("/api/admin/requests-chart")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
