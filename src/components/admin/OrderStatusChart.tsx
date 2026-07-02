"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface OrderStatusChartProps {
  data: { name: string; value: number }[];
}

const COLORS: Record<string, string> = {
  PROCESSING: "#111111",
  PRINTING: "#555555",
  SHIPPED: "#888888",
  DELIVERED: "#AAAAAA",
  CANCELLED: "#DDDDDD",
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  if (data.every((d) => d.value === 0)) {
    return (
      <div className="h-60 flex items-center justify-center text-sm text-[#666666]">
        No orders yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name] ?? "#999999"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#FAF7F2",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 4,
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: "#666666" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}