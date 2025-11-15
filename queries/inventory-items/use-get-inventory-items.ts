import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetInventoryItems = (params: {
  search?: string;
  page?: string;
  limit?: string;
  stationIds?: string;
  categoryId?: string;
  status?: string;
  expiryFrom?: string;
  expiryTo?: string;
}) => {
  const query = useQuery({
    queryKey: ["inventory-items", params],

    queryFn: async () => {
      const res = await client.api["inventory-items"].admin.$get({
        query: params,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };

        throw new Error(errorData.message || "Erro ao buscar os lotes");
      }

      const responseData = await res.json();
      return responseData;
    },
  });

  return query;
};
