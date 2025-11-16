import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.products)["delete"]["$post"]
>;

export const useDeleteProducts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api.products.delete.$post({
        json: { ids },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao deletar os produtos");
      }

      const data = await res.json();

      return data;
    },
    onSuccess: (_data) => {
      toast.success("Produtos deletados com sucesso!");

      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
    },
    onError: (error) => {
      console.error("Erro ao deletar produtos:", error);
      toast.error(error.message);
    },
  });

  return mutation;
};
