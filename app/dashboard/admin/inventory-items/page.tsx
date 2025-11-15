import { InventoryItemsClient } from "@/components/admin/inventory-items/client";
import { db } from "@/db";
import { categories, stations } from "@/db/schema";
import { requireAuth } from "@/lib/auth-utils";

const InventoryItemsPage = async () => {
  await requireAuth();

  const [stationsData, categoriesData] = await Promise.all([
    db.select().from(stations),
    db.select().from(categories),
  ]);

  return (
    <InventoryItemsClient stations={stationsData} categories={categoriesData} />
  );
};

export default InventoryItemsPage;
