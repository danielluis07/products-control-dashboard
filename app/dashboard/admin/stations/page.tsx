import { StationsClient } from "@/components/admin/stations/client";
import { requireAuth } from "@/lib/auth-utils";

const StationsPage = async () => {
  await requireAuth();

  return <StationsClient />;
};

export default StationsPage;
