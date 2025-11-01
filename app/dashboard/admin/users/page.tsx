import { UsersClient } from "@/components/admin/users/client";
import { db } from "@/db";
import { stations } from "@/db/schema";
import { requireAuth } from "@/lib/auth-utils";

const UsersPage = async () => {
  await requireAuth();

  const stationsData = await db
    .select({
      id: stations.id,
      name: stations.name,
    })
    .from(stations);

  return <UsersClient stationsData={stationsData || []} />;
};

export default UsersPage;
