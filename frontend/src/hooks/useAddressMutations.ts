// hooks/useAddressMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api";

export const useAddressMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["addresses"] });

  return {
    create: useMutation({ mutationFn: (data: any) => API.post("/addresses", data), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, data }: { id: number; data: any }) => API.put(`/addresses/${id}`, data), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: number) => API.delete(`/addresses/${id}`), onSuccess: invalidate }),
  };
};