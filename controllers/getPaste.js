import redis from "../redis.js";

export const getPaste = async (req, res) => {
  const { id } = req.params;
  const key = `paste:${id}`;

  // Fetch paste
  const data = await redis.hGetAll(key);

  // Not found
  if (!data || !data.content) {
    return res.status(404).json({ error: "Paste not found" });
  }

  // Determine current time
  const isTestMode = process.env.TEST_MODE === "1";
  const now = isTestMode && req.header("x-test-now-ms")
    ? Number(req.header("x-test-now-ms"))
    : Date.now();

  // TTL check
  let expiresAt = null;
  if (data.expires_at) {
    expiresAt = Number(data.expires_at);
    if (now >= expiresAt) {
      await redis.del(key);
      return res.status(404).json({ error: "Paste expired" });
    }
  }

  // View limit check
  let remainingViews = null;
  if (data.remaining_views) {
    remainingViews = Number(data.remaining_views);

    if (remainingViews <= 0) {
      await redis.del(key);
      return res.status(404).json({ error: "View limit exceeded" });
    }

    // Decrement view count atomically
    remainingViews -= 1;
    await redis.hSet(key, "remaining_views", remainingViews.toString());

    if (remainingViews === 0) {
      await redis.del(key);
    }
  }

  // Success response
  res.status(200).json({
    content: data.content,
    remaining_views: remainingViews,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
  });
};
