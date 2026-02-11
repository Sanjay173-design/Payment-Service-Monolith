const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth.routes");
const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes");
const refundRoutes = require("./routes/refund.routes");
const settlementRoutes = require("./routes/settlement.routes");
const reconciliationRoutes = require("./routes/reconciliation.routes");
const escrowRoutes = require("./routes/escrow.routes");
const crypto = require("crypto");

const app = express();

// Security
app.use(helmet());
app.use(cors());
app.use(express.json());

//Crypto
const payload = JSON.stringify({
  paymentRef: "PAY_1770791486524",
  status: "SUCCESS",
  gatewayData: {
    gateway: "Razorpay",
    txnId: "654987",
  },
});

const signature = crypto
  .createHmac("sha256", "superwebhooksecretkey")
  .update(payload)
  .digest("hex");

console.log("signsture is", signature);

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/settlements", settlementRoutes);
app.use("/api/reconciliation", reconciliationRoutes);
app.use("/api/escrow", escrowRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Payment Service Running 🚀" });
});

module.exports = app;
