exports.log = {
  info: (...a) => console.log("[INFO]", ...a),
  warn: (...a) => console.warn("[WARN]", ...a),
  error: (...a) => console.error("[ERROR]", ...a),
  success: (...a) => console.log("[OK]", ...a),
  debug: (...a) => console.log("[DBG]", ...a),
};
