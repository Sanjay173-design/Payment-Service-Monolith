const express = require("express");
const router = express.Router();

const { handlePaymentWebhook } = require("../controllers/webhook.controller");

router.post("/payment", handlePaymentWebhook);

module.exports = router;
