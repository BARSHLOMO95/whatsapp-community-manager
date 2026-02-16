import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../services/api";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.getAll,
  });
}

export function useGroup(id) {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: () => groupsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => groupsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: groupsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useTestGroup() {
  return useMutation({
    mutationFn: groupsApi.test,
  });
}
