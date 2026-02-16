import express from "express";
import cors from "cors";
import { config } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import productRoutes from "./src/routes/products.js";
import groupRoutes from "./src/routes/groups.js";
import scheduleRoutes from "./src/routes/schedules.js";
import messageLogRoutes from "./src/routes/messageLogs.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import aliexpressRoutes from "./src/routes/aliexpress.js";
import { schedulerService } from "./src/services/scheduler.js";

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

// Serve React frontend in production
if (config.nodeEnv === "production") {
  const { default: path } = await import("path");
  const { fileURLToPath } = await import("url");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, "client", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
}

app.use(errorHandler);

async function start() {
  await connectDB();
  schedulerService.start();
  app.listen(config.port, () =>
    console.log(`Server running on port ${config.port}`)
  );
}

start();
