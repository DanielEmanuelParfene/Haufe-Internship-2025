const vscode = require("vscode");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { getOutputPanelHTML } = require("../ui/outputPanel");
const { log } = require("../utils/logger");

function sendToOllama(prompt, title) {
  const panel = vscode.window.createWebviewPanel(
    "ollamaPanel",
    title,
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
    }
  );

  const requestId = uuidv4();
  panel.webview.html = getOutputPanelHTML();

  panel.webview.onDidReceiveMessage(async (msg) => {
    if (msg.command === "stop") {
      log.warn("🛑 Stopping generation...");
      try {
        await axios.post("http://127.0.0.1:4000/stop", { requestId });
        panel.webview.postMessage({
          type: "status",
          message: "Stopped successfully",
        });
      } catch (err) {
        panel.webview.postMessage({
          type: "error",
          message: "Failed to stop process: " + err.message,
        });
      }
    }
  });

  axios
    .post(
      "http://127.0.0.1:4000/generate",
      { prompt, requestId },
      { responseType: "stream" }
    )
    .then((res) => {
      res.data.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.response)
                panel.webview.postMessage({
                  type: "content",
                  text: data.response,
                });
              if (data.done) panel.webview.postMessage({ type: "done" });
              if (data.error)
                panel.webview.postMessage({
                  type: "error",
                  message: data.error,
                });
            } catch {}
          }
        }
      });
    })
    .catch((err) => {
      panel.webview.postMessage({
        type: "error",
        message: "Connection failed: " + err.message,
      });
    });
}

module.exports = { sendToOllama };
