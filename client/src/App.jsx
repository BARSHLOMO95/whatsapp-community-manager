import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import GroupsPage from "./pages/GroupsPage";
import SchedulesPage from "./pages/SchedulesPage";
import MessageLogsPage from "./pages/MessageLogsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/message-logs" element={<MessageLogsPage />} />
      </Route>
    </Routes>
  );
}
