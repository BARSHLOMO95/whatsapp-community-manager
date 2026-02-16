import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../services/api";

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.getAll(params),
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useSendProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, groupId }) =>
      productsApi.send(productId, groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["message-logs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
