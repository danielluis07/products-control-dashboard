"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Produtos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ProductsByCategoryChart({
  data,
}: {
  data: Array<{
    categoryName: string | null;
    count: number;
  }>;
}) {
  // Formatar os dados para o gráfico
  const chartData = data.map((item) => ({
    category: item.categoryName || "Sem Categoria",
    count: item.count,
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
