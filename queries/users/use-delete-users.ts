import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.users)["delete"]["$post"]
>;

type User = InferResponseType<(typeof client.api.users)["$get"], 200>["data"];

export const useDeleteUsers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api.users.delete.$post({
        json: { ids },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao deletar os usuários");
      }

      const data = await res.json();

      return data;
    },
    onSuccess: (_data, ids) => {
      toast.success("Usuários deletados com sucesso!");
      queryClient.setQueryData(["users"], (oldData: User | undefined) => {
        return oldData ? oldData.filter((user) => !ids.includes(user.id)) : [];
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar os usuários!");
      console.error(error);
    },
  });

  return mutation;
};
