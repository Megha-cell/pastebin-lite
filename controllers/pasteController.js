import redis from "../redis.js";
import crypto from "crypto";

export const createPaste = async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;

  // Validation 
  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (
    ttl_seconds !== undefined &&
    (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
  ) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (
    max_views !== undefined &&
    (!Number.isInteger(max_views) || max_views < 1)
  ) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = crypto.randomUUID();
  const key = `paste:${id}`;

  const now = Date.now();
  const expires_at = ttl_seconds ? now + ttl_seconds * 1000 : null;

  
  await redis.hSet(key, "content", content);

  if (expires_at !== null) {
    await redis.hSet(key, "expires_at", expires_at.toString());
  }

  if (max_views !== undefined) {
    await redis.hSet(key, "remaining_views", max_views.toString());
  }

  if (ttl_seconds) {
    await redis.expire(key, ttl_seconds);
  }

  res.status(201).json({
    id,
    url: `https://pastebin-lite-blond-seven.vercel.app/p/${id}`,
  });
};
