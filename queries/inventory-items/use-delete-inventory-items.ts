import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api)["inventory-items"]["admin"]["delete"]["$post"]
>;

export const useDeleteInventoryItems = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api["inventory-items"].admin.delete.$post({
        json: { ids },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao deletar os itens");
      }

      return await res.json();
    },
    onSuccess: (_data) => {
      toast.success("Itens deletados com sucesso!");

      // Invalida TODAS as queries que começam com ["inventory-items"]
      // Isso inclui ["inventory-items"] e ["inventory-items", params]
      queryClient.invalidateQueries({
        queryKey: ["inventory-items"],
        exact: false, // garante que invalida parcialmente
      });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar os itens!");
      console.error(error);
    },
  });

  return mutation;
};
