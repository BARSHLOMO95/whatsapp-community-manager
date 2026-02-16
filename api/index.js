import express from "express";
import cors from "cors";
import { errorHandler } from "../src/middleware/errorHandler.js";
import productRoutes from "../src/routes/products.js";
import groupRoutes from "../src/routes/groups.js";
import scheduleRoutes from "../src/routes/schedules.js";
import messageLogRoutes from "../src/routes/messageLogs.js";
import dashboardRoutes from "../src/routes/dashboard.js";
import aliexpressRoutes from "../src/routes/aliexpress.js";

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/products", productRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/message-logs", messageLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/aliexpress", aliexpressRoutes);

app.use(errorHandler);

export default app;
