import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageLogsApi } from "../services/api";
import { useGroups } from "../hooks/useGroups";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatusBadge from "../components/common/StatusBadge";
import { format } from "date-fns";

export default function MessageLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    groupId: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const params = { page, limit: 20, ...filters };
  // Remove empty filter values
  Object.keys(params).forEach((k) => {
    if (!params[k]) delete params[k];
  });

  const { data, isLoading } = useQuery({
    queryKey: ["message-logs", params],
    queryFn: () => messageLogsApi.getAll(params),
  });

  const { data: groups } = useGroups();

  if (isLoading) return <LoadingSpinner />;

  const logs = data?.logs || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Message Logs</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.groupId}
            onChange={(e) => {
              setFilters({ ...filters, groupId: e.target.value });
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Groups</option>
            {groups?.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => {
              setFilters({ ...filters, startDate: e.target.value });
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => {
              setFilters({ ...filters, endDate: e.target.value });
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No message logs found</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Group</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {log.sent_at
                      ? format(new Date(log.sent_at), "dd/MM/yyyy HH:mm")
                      : format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {log.products?.image_url && (
                        <img
                          src={log.products.image_url}
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="truncate max-w-[150px]">
                        {log.products?.name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{log.groups?.name || "Unknown"}</td>
                  <td className="px-4 py-3 text-xs capitalize">{log.trigger_type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500 max-w-[200px] truncate">
                    {log.error_message || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 text-sm rounded ${
                p === page
                  ? "bg-green-600 text-white"
                  : "bg-white border hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
