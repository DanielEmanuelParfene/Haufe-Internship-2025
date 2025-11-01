const {
  generateFromOllama,
  stopOllamaRequest,
} = require("../services/ollamaServices");
const { log } = require("../utils/logger");

const activeStreams = new Map(); // requestId → stream reference

exports.generateHandler = async (req, res) => {
  const { prompt, requestId } = req.body;

  console.log(prompt)

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  if (!requestId)
    return res.status(400).json({ error: "Request ID is required" });

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    log.info(`📤 [${requestId}] Sending request to Ollama...`);
    const ollamaStream = await generateFromOllama(prompt, requestId, res);

    // memorize stream so we can stop it later
    activeStreams.set(requestId, ollamaStream);

    req.on("close", () => {
      log.warn(`🛑 Client disconnected for ${requestId}`);
      if (activeStreams.has(requestId)) {
        activeStreams.get(requestId).destroy();
        activeStreams.delete(requestId);
      }
    });
  } catch (err) {
    log.error(`❌ Request error for ${requestId}: ${err.message}`);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Failed to connect to Ollama", details: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

exports.stopHandler = (req, res) => {
  const { requestId } = req.body;
  if (!requestId)
    return res.status(400).json({ error: "Request ID is required" });

  const stream = activeStreams.get(requestId);
  if (stream) {
    stream.destroy();
    activeStreams.delete(requestId);
    log.warn(`🧨 Stopped generation for ${requestId}`);
    return res.json({ stopped: true });
  } else {
    return res
      .status(404)
      .json({ error: "No active generation found for this ID" });
  }
};

exports.healthHandler = (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
};
