import {
  useDashboardStats,
  useRecentMessages,
  useScheduleOverview,
} from "../hooks/useDashboard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatusBadge from "../components/common/StatusBadge";
import {
  Package,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentMessages();
  const { data: upcoming, isLoading: upcomingLoading } = useScheduleOverview();

  if (statsLoading) return <LoadingSpinner />;

  const statCards = [
    {
      label: "Active Products",
      value: stats?.activeProducts || 0,
      icon: Package,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Active Groups",
      value: stats?.activeGroups || 0,
      icon: Users,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Messages Today",
      value: stats?.messagesToday || 0,
      icon: MessageSquare,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Success Rate",
      value: `${stats?.successRate || 100}%`,
      icon: TrendingUp,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">Recent Messages</h2>
          {recentLoading ? (
            <LoadingSpinner />
          ) : recent?.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages sent yet</p>
          ) : (
            <div className="space-y-3">
              {recent?.map((msg) => (
                <div
                  key={msg._id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {msg.productId?.imageUrl && (
                      <img
                        src={msg.productId.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {msg.productId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {msg.groupId?.name || "Unknown group"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={msg.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">Upcoming Today</h2>
          {upcomingLoading ? (
            <LoadingSpinner />
          ) : upcoming?.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming sends today</p>
          ) : (
            <div className="space-y-3">
              {upcoming?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {String(item.hour).padStart(2, "0")}:
                        {String(item.minute).padStart(2, "0")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.groupName} - {item.productsPerSlot} product(s)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {item.strategy}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
