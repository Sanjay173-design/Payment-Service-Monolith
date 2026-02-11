const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createPayment,
  getPayment,
  updatePaymentStatus,
} = require("../controllers/payment.controller");

router.post("/create", authMiddleware, createPayment);
router.get("/:id", authMiddleware, getPayment);
router.put("/status/:id", authMiddleware, updatePaymentStatus);

module.exports = router;
