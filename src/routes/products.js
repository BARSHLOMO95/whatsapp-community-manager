import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest.js";
import Product from "../models/Product.js";
import Group from "../models/Group.js";
import MessageLog from "../models/MessageLog.js";
import { greenApiService } from "../services/greenApi.js";
import { formatProductMessage } from "../services/messageFormatter.js";

const router = Router();

// GET /api/products - List products with pagination and filters
router.get("/", async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      isActive,
    } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create product
router.post(
  "/",
  [
    body("name").notEmpty().trim(),
    body("price").isNumeric(),
    body("description").notEmpty().isLength({ max: 500 }),
    body("imageUrl").notEmpty(),
    body("affiliateLink").notEmpty(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/products/:id - Update product
router.put("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Soft delete
router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deactivated", product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products/:id/send - Manual send to a group
router.post("/:id/send", async (req, res, next) => {
  try {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ error: "groupId is required" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const log = await MessageLog.create({
      groupId: group._id,
      productId: product._id,
      status: "pending",
      triggerType: "manual",
    });

    try {
      const messageText = formatProductMessage(product, {
        prefix: group.settings?.messagePrefix,
        suffix: group.settings?.messageSuffix,
        language: group.settings?.language,
      });

      const result = await greenApiService.sendProductMessage(
        group.chatId,
        product,
        {
          prefix: group.settings?.messagePrefix,
          suffix: group.settings?.messageSuffix,
          language: group.settings?.language,
        }
      );

      log.status = "sent";
      log.greenApiMessageId = result.idMessage;
      log.messageContent = messageText;
      log.sentAt = new Date();
      await log.save();

      product.timesSent += 1;
      product.lastSentAt = new Date();
      await product.save();

      group.totalMessagesSent += 1;
      group.lastMessageSentAt = new Date();
      await group.save();

      res.json({ message: "Product sent successfully", log });
    } catch (sendError) {
      log.status = "failed";
      log.errorMessage = sendError.message;
      await log.save();
      res.status(500).json({ error: "Failed to send message", details: sendError.message });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
