import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest.js";
import { supabase } from "../config/db.js";
import { greenApiService } from "../services/greenApi.js";
import { formatProductMessage } from "../services/messageFormatter.js";

const router = Router();

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, isActive } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from("products").select("*", { count: "exact" });

    if (search) query = query.ilike("name", `%${search}%`);
    if (category) query = query.eq("category", category);
    if (isActive !== undefined) query = query.eq("is_active", isActive === "true");

    const { data: products, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) throw error;

    res.json({
      products,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error) return res.status(404).json({ error: "Product not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/products
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
      const { name, price, originalPrice, currency, description, imageUrl, affiliateLink, category, tags } = req.body;
      const { data, error } = await supabase
        .from("products")
        .insert({
          name,
          price,
          original_price: originalPrice,
          currency,
          description,
          image_url: imageUrl,
          affiliate_link: affiliateLink,
          category,
          tags,
        })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/products/:id
router.put("/:id", async (req, res, next) => {
  try {
    const updates = {};
    const fieldMap = {
      name: "name", price: "price", originalPrice: "original_price",
      currency: "currency", description: "description", imageUrl: "image_url",
      affiliateLink: "affiliate_link", category: "category", tags: "tags",
      isActive: "is_active",
    };
    for (const [camel, snake] of Object.entries(fieldMap)) {
      if (req.body[camel] !== undefined) updates[snake] = req.body[camel];
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(404).json({ error: "Product not found" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Soft delete
router.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deactivated", product: data });
  } catch (error) {
    next(error);
  }
});

// POST /api/products/:id/send - Manual send
router.post("/:id/send", async (req, res, next) => {
  try {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ error: "groupId is required" });

    const { data: product, error: pErr } = await supabase
      .from("products").select("*").eq("id", req.params.id).single();
    if (pErr) return res.status(404).json({ error: "Product not found" });

    const { data: group, error: gErr } = await supabase
      .from("groups").select("*").eq("id", groupId).single();
    if (gErr) return res.status(404).json({ error: "Group not found" });

    const { data: log } = await supabase
      .from("message_logs")
      .insert({ group_id: group.id, product_id: product.id, status: "pending", trigger_type: "manual" })
      .select()
      .single();

    try {
      const messageText = formatProductMessage(
        { name: product.name, price: product.price, originalPrice: product.original_price, currency: product.currency, description: product.description, imageUrl: product.image_url, affiliateLink: product.affiliate_link },
        { prefix: group.message_prefix, suffix: group.message_suffix, language: group.language }
      );

      const result = await greenApiService.sendProductMessage(
        group.chat_id,
        { name: product.name, imageUrl: product.image_url, price: product.price, originalPrice: product.original_price, currency: product.currency, description: product.description, affiliateLink: product.affiliate_link },
        { prefix: group.message_prefix, suffix: group.message_suffix, language: group.language }
      );

      await supabase.from("message_logs").update({
        status: "sent", green_api_message_id: result.idMessage, message_content: messageText, sent_at: new Date().toISOString(),
      }).eq("id", log.id);

      await supabase.from("products").update({
        times_sent: product.times_sent + 1, last_sent_at: new Date().toISOString(),
      }).eq("id", product.id);

      await supabase.from("groups").update({
        total_messages_sent: group.total_messages_sent + 1, last_message_sent_at: new Date().toISOString(),
      }).eq("id", group.id);

      res.json({ message: "Product sent successfully", log });
    } catch (sendError) {
      await supabase.from("message_logs").update({
        status: "failed", error_message: sendError.message,
      }).eq("id", log.id);
      res.status(500).json({ error: "Failed to send message", details: sendError.message });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
