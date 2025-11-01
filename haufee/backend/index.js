const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

// 🔹 Păstrăm referințe la requesturi active (pentru stop)
const activeRequests = new Map();

app.post("/generate", async (req, res) => {
  const { prompt, requestId } = req.body;

  if (!prompt || !requestId) {
    return res.status(400).json({ error: "Prompt and requestId are required" });
  }

  // Set headers pentru SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const controller = new AbortController();
  activeRequests.set(requestId, controller);

  try {
    console.log(`📤 Sending request ${requestId} to Ollama...`);

    const response = await axios.post(
      OLLAMA_URL,
      {
        model: "codellama:7b",
        prompt,
        stream: true,
      },
      {
        responseType: "stream",
        signal: controller.signal,
      }
    );

    // Oprire automată dacă utilizatorul închide conexiunea
    req.on("close", () => {
      console.log(`🛑 Client disconnected for ${requestId}`);
      controller.abort();
      activeRequests.delete(requestId);
      response.data.destroy();
    });

    response.data.on("data", (chunk) => {
      try {
        const lines = chunk
          .toString()
          .split("\n")
          .filter((line) => line.trim());
        for (const line of lines) {
          const parsed = JSON.parse(line);

          // Trimitem fiecare bucată prin SSE
          res.write(`data: ${JSON.stringify(parsed)}\n\n`);

          // Finalizare
          if (parsed.done) {
            console.log(`✅ Generation complete for ${requestId}`);
            res.write("data: [DONE]\n\n");
            res.end();
            activeRequests.delete(requestId);
          }
        }
      } catch (parseError) {
        console.error("❌ Parse error:", parseError.message);
      }
    });

    response.data.on("end", () => {
      console.log(`🏁 Stream ended for ${requestId}`);
      if (!res.writableEnded) {
        res.write("data: [DONE]\n\n");
        res.end();
      }
      activeRequests.delete(requestId);
    });

    response.data.on("error", (error) => {
      console.error("❌ Ollama stream error:", error.message);
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
      activeRequests.delete(requestId);
    });
  } catch (error) {
    console.error(`❌ Request error for ${requestId}:`, error.message);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to connect to Ollama",
        details: error.message,
      });
    } else if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }

    activeRequests.delete(requestId);
  }
});

// 🔹 Nou endpoint pentru STOP
app.post("/stop", (req, res) => {
  const { requestId } = req.body;
  const controller = activeRequests.get(requestId);

  if (controller) {
    console.log(`🛑 Stopping generation for ${requestId}`);
    controller.abort();
    activeRequests.delete(requestId);
    return res.json({ success: true, message: "Generation stopped" });
  }

  res.status(404).json({ error: "No active generation found" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 Ready to receive requests from VS Code extension`);
  console.log(`🔗 Using Ollama at ${OLLAMA_URL}`);
});
