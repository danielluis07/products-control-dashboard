import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetUsers = () => {
  const query = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await client.api.users.$get();

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao buscar os usuários");
      }

      const { data } = await res.json();
      return data;
    },
  });

  return query;
};
