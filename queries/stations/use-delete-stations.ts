import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.stations)["delete"]["$post"]
>;

type Station = InferResponseType<
  (typeof client.api.stations)["$get"],
  200
>["data"];

export const useDeleteStations = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api.stations.delete.$post({
        json: { ids },
      });
      return await res.json();
    },
    onSuccess: (_data, ids) => {
      toast.success("Postos deletados com sucesso!");
      queryClient.setQueryData(["stations"], (oldData: Station | undefined) => {
        return oldData
          ? oldData.filter((station) => !ids.includes(station.id))
          : [];
      });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar os postos!");
      console.error(error);
    },
  });

  return mutation;
};
