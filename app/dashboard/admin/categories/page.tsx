import { CategoriesClient } from "@/components/admin/categories/client";
import { requireAuth } from "@/lib/auth-utils";

const CategoriesPage = async () => {
  await requireAuth();

  return <CategoriesClient />;
};

export default CategoriesPage;
