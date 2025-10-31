import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetStation = (id: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["station", id],
    queryFn: async () => {
      const res = await client.api.stations[":id"].$get({
        param: { id },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao buscar o posto");
      }

      const { data } = await res.json();
      return data;
    },
  });

  return query;
};
