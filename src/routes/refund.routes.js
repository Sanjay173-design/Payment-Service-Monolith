const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const { createRefund } = require("../controllers/refund.controller");

router.post("/create", authMiddleware, createRefund);

module.exports = router;
