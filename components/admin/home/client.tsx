"use client";

import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { ProductsByCategoryChart } from "@/components/admin/home/charts/products-by-category";
import { ActiveProductsChart } from "@/components/admin/home/charts/active-products";
import { StatsCard } from "@/components/admin/home/stats-card";

export const HomeClient = ({
  totalProducts,
  upTo3Days,
  fourTo15Days,
  above15Days,
  productsByCategory,
}: {
  totalProducts: { count: number };
  upTo3Days: { count: number };
  fourTo15Days: { count: number };
  above15Days: { count: number };
  productsByCategory: { categoryName: string | null; count: number }[];
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="size-20" />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total de Produtos" number={totalProducts.count} />
        <StatsCard label="Vencimento até 3 dias" number={upTo3Days.count} />
        <StatsCard
          label="Vencimento entre 4 e 15 dias"
          number={fourTo15Days.count}
        />
        <StatsCard
          label="Vencimento acima de 15 dias"
          number={above15Days.count}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">
            Distribuição por Prazo de Vencimento
          </h3>
          <ActiveProductsChart
            upTo3Days={upTo3Days.count}
            fourTo15Days={fourTo15Days.count}
            above15Days={above15Days.count}
            totalProducts={totalProducts.count}
          />
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Produtos por Categoria</h3>
          <ProductsByCategoryChart data={productsByCategory} />
        </div>
      </div>
    </div>
  );
};
