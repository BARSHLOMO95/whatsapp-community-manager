import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesApi } from "../services/api";

export function useSchedules() {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: schedulesApi.getAll,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: schedulesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => schedulesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: schedulesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useExecuteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: schedulesApi.execute,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      qc.invalidateQueries({ queryKey: ["message-logs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
