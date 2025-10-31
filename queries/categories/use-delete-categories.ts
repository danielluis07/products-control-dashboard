import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.categories)["delete"]["$post"]
>;

type Category = InferResponseType<
  (typeof client.api.categories)["$get"],
  200
>["data"];

export const useDeleteCategories = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api.categories.delete.$post({
        json: { ids },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao deletar as categorias");
      }

      const data = await res.json();

      return data;
    },
    onSuccess: (_data, ids) => {
      toast.success("Categorias deletadas com sucesso!");
      queryClient.setQueryData(
        ["categories"],
        (oldData: Category | undefined) => {
          return oldData
            ? oldData.filter((category) => !ids.includes(category.id))
            : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar as categorias!");
      console.error(error);
    },
  });

  return mutation;
};
