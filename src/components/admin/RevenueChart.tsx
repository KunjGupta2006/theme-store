"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#666666" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#666666" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "#FAF7F2",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 4,
            fontSize: 12,
          }}
          formatter={(value) => {
            if (typeof value === "number") {
              return `₹${value.toLocaleString("en-IN")}`;
            }
            return value;
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#111111"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: "#111111" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}