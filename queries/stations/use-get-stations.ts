import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetStations = () => {
  const query = useQuery({
    queryKey: ["stations"],
    queryFn: async () => {
      const res = await client.api.stations.$get();

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao buscar os postos");
      }

      const { data } = await res.json();
      return data;
    },
  });

  return query;
};
