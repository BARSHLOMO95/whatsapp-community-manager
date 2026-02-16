import { Router } from "express";
import { fetchOrders } from "../services/aliexpress.js";

const router = Router();

router.get("/orders", async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const data = await fetchOrders(start, end);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
