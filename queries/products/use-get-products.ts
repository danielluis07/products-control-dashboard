import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetProducts = (params: {
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const query = useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await client.api.products.admin.$get({
        query: params,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao buscar os produtos");
      }

      const data = await res.json();
      return data;
    },
  });

  return query;
};
