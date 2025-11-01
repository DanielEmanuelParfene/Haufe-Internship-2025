const express = require("express");
const router = express.Router();
const {
  generateHandler,
  stopHandler,
  healthHandler,
} = require("../controllers/ollamaController");

router.post("/generate", generateHandler);
router.post("/stop", stopHandler);
router.get("/health", healthHandler);

module.exports = router;
