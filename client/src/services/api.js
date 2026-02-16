import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const productsApi = {
  getAll: (params) => api.get("/products", { params }).then((r) => r.data),
  getOne: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (data) => api.post("/products", data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  send: (id, groupId) =>
    api.post(`/products/${id}/send`, { groupId }).then((r) => r.data),
};

export const groupsApi = {
  getAll: () => api.get("/groups").then((r) => r.data),
  getOne: (id) => api.get(`/groups/${id}`).then((r) => r.data),
  create: (data) => api.post("/groups", data).then((r) => r.data),
  update: (id, data) => api.put(`/groups/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/groups/${id}`).then((r) => r.data),
  test: (id) => api.post(`/groups/${id}/test`).then((r) => r.data),
};

export const schedulesApi = {
  getAll: () => api.get("/schedules").then((r) => r.data),
  getOne: (id) => api.get(`/schedules/${id}`).then((r) => r.data),
  create: (data) => api.post("/schedules", data).then((r) => r.data),
  update: (id, data) =>
    api.put(`/schedules/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/schedules/${id}`).then((r) => r.data),
  execute: (id) => api.post(`/schedules/${id}/execute`).then((r) => r.data),
};

export const messageLogsApi = {
  getAll: (params) => api.get("/message-logs", { params }).then((r) => r.data),
  getOne: (id) => api.get(`/message-logs/${id}`).then((r) => r.data),
};

export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats").then((r) => r.data),
  getRecentMessages: () =>
    api.get("/dashboard/recent-messages").then((r) => r.data),
  getScheduleOverview: () =>
    api.get("/dashboard/schedule-overview").then((r) => r.data),
};
