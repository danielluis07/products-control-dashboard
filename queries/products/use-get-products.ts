import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetProducts = () => {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await client.api.products.dashboard.$get();

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao buscar os produtos");
      }

      const { data } = await res.json();
      return data;
    },
  });

  return query;
};
