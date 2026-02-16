import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../services/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,
  });
}

export function useRecentMessages() {
  return useQuery({
    queryKey: ["dashboard", "recent-messages"],
    queryFn: dashboardApi.getRecentMessages,
    refetchInterval: 30000,
  });
}

export function useScheduleOverview() {
  return useQuery({
    queryKey: ["dashboard", "schedule-overview"],
    queryFn: dashboardApi.getScheduleOverview,
    refetchInterval: 60000,
  });
}
