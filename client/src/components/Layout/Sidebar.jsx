import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/schedules", label: "Schedules", icon: Clock },
  { to: "/message-logs", label: "Message Logs", icon: MessageSquare },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-green-400">WA Manager</h1>
        <p className="text-xs text-gray-400 mt-1">WhatsApp Community Manager</p>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
