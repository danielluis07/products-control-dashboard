import { ProductsClient } from "@/components/admin/products/client";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAuth } from "@/lib/auth-utils";

const ProductsPage = async () => {
  await requireAuth();

  const categoriesData = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories);

  return <ProductsClient categoriesData={categoriesData || []} />;
};

export default ProductsPage;
