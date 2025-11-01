const axios = require("axios");
const { log } = require("../utils/logger");

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

/**
 * 🎯 Configurație optimizată pentru Ollama
 */
const OLLAMA_CONFIG = {
  model: "codellama:7b",
  options: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    num_predict: 2048,
  },
};

/**
 * 📊 Procesare și validare prompt
 */
function preprocessPrompt(prompt) {
  const cleaned = prompt.trim().replace(/\n{3,}/g, "\n\n");

  if (cleaned.length < 10) {
    throw new Error("Prompt prea scurt - minim 10 caractere necesare");
  }

  if (cleaned.length > 100000) {
    log.warn(`⚠️ Prompt foarte lung (${cleaned.length} chars)`);
  }

  return cleaned;
}

/**
 * 🚀 Trimitere request către Ollama cu streaming
 */
exports.generateFromOllama = async (prompt, requestId, res) => {
  let streamEnded = false;
  let totalTokens = 0;
  let responseText = "";

  try {
    const processedPrompt = preprocessPrompt(prompt);

    log.info(
      `📤 [${requestId}] Sending to Ollama: ${processedPrompt.length} chars`
    );

    const response = await axios.post(
      OLLAMA_URL,
      {
        model: OLLAMA_CONFIG.model,
        prompt: processedPrompt,
        stream: true,
        options: OLLAMA_CONFIG.options,
      },
      {
        responseType: "stream",
        timeout: 300000,
      }
    );

    // Notificare start
    res.write(
      `data: ${JSON.stringify({
        type: "start",
        model: OLLAMA_CONFIG.model,
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    // Procesare stream cu buffer pentru chunks incomplete
    let buffer = "";

    response.data.on("data", (chunk) => {
      if (streamEnded) return;

      try {
        // Adaugă chunk la buffer
        buffer += chunk.toString();

        // Split pe newline
        const lines = buffer.split("\n");

        // Păstrează ultima linie incompletă în buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const parsed = JSON.parse(line);

            // Log pentru debugging
            if (parsed.response) {
              responseText += parsed.response;
              totalTokens++;

              // Trimite chunk către client
              res.write(`data: ${JSON.stringify(parsed)}\n\n`);
            }

            // Verifică dacă e done
            if (parsed.done) {
              streamEnded = true;

              const stats = {
                type: "stats",
                tokens: totalTokens,
                chars: responseText.length,
                duration: parsed.total_duration,
                eval_count: parsed.eval_count,
                eval_duration: parsed.eval_duration,
              };

              log.success(
                `✅ [${requestId}] Complete: ${stats.tokens} tokens, ` +
                  `${stats.chars} chars in ${(stats.duration / 1e9).toFixed(
                    2
                  )}s`
              );

              res.write(`data: ${JSON.stringify(stats)}\n\n`);
              res.write("data: [DONE]\n\n");
              res.end();
              return;
            }
          } catch (parseErr) {
            log.error(
              `❌ [${requestId}] JSON parse error for line: ${line.substring(
                0,
                100
              )}`
            );
            log.error(`   Error: ${parseErr.message}`);
            // Nu oprește stream-ul pentru o linie invalidă
          }
        }
      } catch (err) {
        log.error(`❌ [${requestId}] Chunk processing error: ${err.message}`);
      }
    });

    response.data.on("end", () => {
      if (streamEnded) return;

      log.info(`🏁 [${requestId}] Stream ended naturally`);

      // Procesează buffer-ul rămas
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.done) {
            log.info(`✅ [${requestId}] Processing final buffer chunk`);
          }
        } catch (e) {
          log.warn(
            `⚠️ [${requestId}] Unparseable buffer at end: ${buffer.substring(
              0,
              50
            )}`
          );
        }
      }

      if (!res.writableEnded) {
        log.info(`📝 [${requestId}] Sending final DONE signal`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    });

    response.data.on("error", (err) => {
      if (streamEnded) return;

      log.error(`❌ [${requestId}] Ollama stream error: ${err.message}`);
      streamEnded = true;

      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({
            error: "Stream error",
            details: err.message,
          })}\n\n`
        );
        res.end();
      }
    });

    return response.data;
  } catch (error) {
    log.error(`❌ [${requestId}] Request failed: ${error.message}`);
    log.error(`   Stack: ${error.stack}`);

    if (error.code === "ECONNREFUSED") {
      throw new Error("Cannot connect to Ollama. Is it running on port 11434?");
    }

    if (error.response?.status === 404) {
      throw new Error(
        `Model ${OLLAMA_CONFIG.model} not found. Please pull it first.`
      );
    }

    throw error;
  }
};

exports.stopOllamaRequest = async (requestId) => {
  log.info(`🛑 [${requestId}] Stop requested`);
};

exports.checkOllamaHealth = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:11434/api/tags", {
      timeout: 5000,
    });

    log.success(
      `✅ Ollama is running - ${
        response.data.models?.length || 0
      } models available`
    );
    return {
      status: "ok",
      models: response.data.models,
    };
  } catch (error) {
    log.error(`❌ Ollama health check failed: ${error.message}`);
    throw new Error("Ollama is not accessible");
  }
};
