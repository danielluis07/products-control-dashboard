import { requireAuth } from "@/lib/auth-utils";

const CategoriesPage = async () => {
  const { user } = await requireAuth();

  return (
    <div>
      <p>Categories Page</p>
    </div>
  );
};

export default CategoriesPage;
