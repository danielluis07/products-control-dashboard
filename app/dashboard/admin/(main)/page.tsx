import { StatsCard } from "@/components/admin/home/stats-card";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { and, count, gt, gte, lte, eq } from "drizzle-orm";
import { ActiveProductsChart } from "@/components/admin/home/charts/active-products";
import { ProductsByCategoryChart } from "@/components/admin/home/charts/products-by-category";
import { HomeClient } from "@/components/admin/home/client";

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

    db
      .select({ count: count() })
      .from(products)
      .where(lte(products.notificationThresholdDays, 3))
      .then((res) => res[0]),

    db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          gte(products.notificationThresholdDays, 4),
          lte(products.notificationThresholdDays, 15)
        )
      )
      .then((res) => res[0]),

    db
      .select({ count: count() })
      .from(products)
      .where(gt(products.notificationThresholdDays, 15))
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
    <HomeClient
      totalProducts={totalProducts}
      upTo3Days={upTo3Days}
      fourTo15Days={fourTo15Days}
      above15Days={above15Days}
      productsByCategory={productsByCategory}
    />
  );
};

export default MainPage;
