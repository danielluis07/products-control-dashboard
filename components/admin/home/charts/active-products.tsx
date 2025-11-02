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
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ActiveProductsChart({
  upTo3Days,
  fourTo15Days,
  above15Days,
  totalProducts,
}: {
  upTo3Days: number;
  fourTo15Days: number;
  above15Days: number;
  totalProducts: number;
}) {
  const chartData = [
    { category: "Até 3 dias", count: upTo3Days },
    { category: "4 a 15 dias", count: fourTo15Days },
    { category: "Acima de 15 dias", count: above15Days },
    { category: "Total", count: totalProducts },
  ];

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
