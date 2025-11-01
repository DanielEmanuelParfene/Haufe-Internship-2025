const express = require("express");
const cors = require("cors");
const ollamaRoutes = require("./routes/ollamaRoutes");
const { log } = require("./utils/logger");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", ollamaRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  log.success(`🚀 Server is running on http://localhost:${PORT}`);
  log.info(`📡 Ready to receive requests from VS Code extension`);
  log.info(`🔗 Using Ollama at http://127.0.0.1:11434/api/generate`);
});
