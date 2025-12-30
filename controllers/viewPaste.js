import redis from "../redis.js";


const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const viewPaste = async (req, res) => {
  const { id } = req.params;
  const key = `paste:${id}`;

  const data = await redis.hGetAll(key);

  if (!data || !data.content) {
    return res.status(404).send("Paste not found");
  }

  // Determine time
  const isTestMode = process.env.TEST_MODE === "1";
  const now = isTestMode && req.header("x-test-now-ms")
    ? Number(req.header("x-test-now-ms"))
    : Date.now();

  // TTL check
  if (data.expires_at && now >= Number(data.expires_at)) {
    await redis.del(key);
    return res.status(404).send("Paste expired");
  }

  // View limit check
  if (data.remaining_views) {
    const views = Number(data.remaining_views);
    if (views <= 0) {
      await redis.del(key);
      return res.status(404).send("Paste unavailable");
    }

    await redis.hSet(key, "remaining_views", (views - 1).toString());

    if (views - 1 === 0) {
      await redis.del(key);
    }
  }

  const safeContent = escapeHtml(data.content);

  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Paste</title>
        <style>
          body {
            font-family: monospace;
            background: #f5f5f5;
            padding: 20px;
          }
          pre {
            background: white;
            padding: 16px;
            border-radius: 4px;
            white-space: pre-wrap;
            word-break: break-word;
          }
        </style>
      </head>
      <body>
        <pre>${safeContent}</pre>
      </body>
    </html>
  `);
};
