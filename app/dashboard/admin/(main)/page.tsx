import { StatsCard } from "@/components/admin/home/stats-card";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/db";
import { categories, products, inventoryItems } from "@/db/schema";
import { and, count, sql, eq } from "drizzle-orm";
import { ActiveProductsChart } from "@/components/admin/home/charts/active-products";
import { ProductsByCategoryChart } from "@/components/admin/home/charts/products-by-category";

const MainPage = async () => {
  await requireAuth();

  const [
    totalProducts,
    upTo3Days,
    fourTo15Days,
    above15Days,
    productsByCategory,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(products)
      .then((res) => res[0]),

    // Produtos com vencimento até 3 dias (no fuso de SP)
    db
      .select({ count: count() })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.status, "in_stock"),
          sql`${inventoryItems.expiryDate} AT TIME ZONE 'America/Sao_Paulo' >= (NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '3 days'`,
          sql`${inventoryItems.expiryDate} AT TIME ZONE 'America/Sao_Paulo' <= (NOW() AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '3 days'`
        )
      )
      .then((res) => res[0]),

    // Produtos com vencimento entre 4 e 15 dias
    db
      .select({ count: count() })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.status, "in_stock"),
          sql`${inventoryItems.expiryDate} AT TIME ZONE 'America/Sao_Paulo' > (NOW() AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '3 days'`,
          sql`${inventoryItems.expiryDate} AT TIME ZONE 'America/Sao_Paulo' <= (NOW() AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '15 days'`
        )
      )
      .then((res) => res[0]),

    // Produtos com vencimento acima de 15 dias
    db
      .select({ count: count() })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.status, "in_stock"),
          sql`${inventoryItems.expiryDate} AT TIME ZONE 'America/Sao_Paulo' > (NOW() AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '15 days'`
        )
      )
      .then((res) => res[0]),

    db
      .select({
        categoryName: categories.name,
        count: count(),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .groupBy(categories.name),
  ]);

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

export default MainPage;
