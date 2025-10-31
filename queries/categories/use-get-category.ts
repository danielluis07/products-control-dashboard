import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCategory = (id: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["category", id],
    queryFn: async () => {
      const res = await client.api.categories[":id"].$get({
        param: { id },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao buscar a categoria");
      }

      const { data } = await res.json();
      return data;
    },
  });

  return query;
};
