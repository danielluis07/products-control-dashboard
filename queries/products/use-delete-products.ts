import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.products)["delete"]["$post"]
>;

type Product = InferResponseType<
  (typeof client.api.products.dashboard)["$get"],
  200
>["data"];

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
    onSuccess: (_data, ids) => {
      toast.success("Produtos deletados com sucesso!");
      queryClient.setQueryData(["products"], (oldData: Product | undefined) => {
        return oldData
          ? oldData.filter((product) => !ids.includes(product.id))
          : [];
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar os produtos!");
      console.error(error);
    },
  });

  return mutation;
};
