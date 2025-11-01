import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.products.$post>;
type RequestType = InferRequestType<typeof client.api.products.$post>["json"];

export const useCreateProduct = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.products.$post({ json });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errorData.message || "Erro ao criar o produto");
      }

      return await res.json();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
