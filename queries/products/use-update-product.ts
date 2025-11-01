import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.products)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.products)[":id"]["$patch"]
>["json"];

export const useUpdateProduct = (id: string) => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.products[":id"]["$patch"]({
        param: { id },
        json,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao atualizar o produto");
      }

      return await res.json();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
